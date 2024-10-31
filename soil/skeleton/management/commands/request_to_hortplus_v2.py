'''
    Request to new Hortplus weather service. https://staging.api.metwatch.nz

    This started just as a copy of the existing request to there old csv service

    Example: (old API key)
    curl --location --request GET 'https://staging.api.metwatch.nz/api/legacy/historic/daily?station=HAV&start=2022-09-08&stop=2022-09-20' -H "Accept: application/json" -H "X-Api-Key: fUjXn2r5u8x/A?D(G+KbPeShVkYp3s6v"
'''

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
from django.contrib import messages
from skeleton.utils import get_current_season, get_site_season_start_end
from django.conf import settings
from skeleton.models import Reading, Site, Farm, WeatherStation, Season
import os
import json
import requests
import re

# Get an instance of a logger
import logging
logger = logging.getLogger(__name__)

'''
    From command line can just run 'python manage.py request_to_hortplus_v2 --station=HAV --start=2022-09-08 --stop=2022-09-20 --keys=RNDATA
'''

class Command(BaseCommand):
    help = 'Requests data from hortplus version 2'

    def add_arguments(self, parser):
        parser.add_argument('-P', '--purpose', type=str, help='One of process_readings or generate_eoy_data')
        parser.add_argument('-d', '--start', type=str, help='The date to start providing data from. Format YYYY-MM-DD')
        parser.add_argument('-p', '--stop', type=str, help='The date to stop providing data from. Format YYYY-MM-DD')
        parser.add_argument('-t', '--station', type=str, help='The list of weather station ids separated by a comma.')
        parser.add_argument('-k', '--keys', type=str, help='The common keys to get out of what is returned. At the moment will just be RNDATA ')
        parser.add_argument('--sites', type=open, help='A list of sites to get request rainfall for.')

    def handle(self, *args, **kwargs):
        response_text = None
        # get arguments from command line or use ones that will be done autoamtically

        if kwargs['purpose'] is None:
            data = {
                'start': kwargs['start'],
                'stop': kwargs['stop'],
                'station': kwargs['station']
            }
            data_keys = kwargs['keys']
            response = post_request(data, 'RNDATA')
            logger.debug('Response ' + str(response))
        elif kwargs['purpose'] == 'process_readings':
            logger.info('Start processing of readings')
            readings = None
            if kwargs['sites']:
                sites = kwargs['sites']
                logger.info('Starting update of rainfall for sites that have just been uploaded and have a null rain reading.' + str(sites))
                readings = Reading.objects.select_related('site__farm__weatherstation').filter(site__in=sites, rain__isnull=True, type=1)
            else:
                logger.info('Starting update of rainfall for all sites that have a null rain reading')
                readings = Reading.objects.select_related('site__farm__weatherstation').filter(rain__isnull=True, type=1)
            for reading in readings:
                logger.debug('Reading object to process: ' + str(reading))
                season = get_current_season()
                dates = get_site_season_start_end(reading.site, season)

                # If a site has only one reading we cannot calculate the previous reading date. A try block is the only way to catch this
                try:
                    previous_reading = reading.get_previous_by_date(site=reading.site, type=1, date__range=(dates.period_from, dates.period_to))
                except:
                    previous_reading = None
                if previous_reading:
                    site = reading.site
                    farm = site.farm
                    weatherstation = farm.weatherstation

                    logger.debug('Previous Reading:' + str(previous_reading))
                    logger.debug('Todays Reading:' + str(reading.date))
                    # Startdate is previous reading plus one day
                    startdate = previous_reading.date + timedelta(days=1)
                    logger.debug('startdate:' + str(startdate) + ' stopdate:' + str(reading.date))

                    data = {
                        'start': str(startdate),
                        'stop': str(reading.date),
                        'station': weatherstation.code
                    }

                    response = post_request(data, 'RNDATA')
                    logger.debug('Response ' + str(response))
                    rainfall = 0
                    for rain in response:
                        logger.debug('Rain:' + str(rain))
                        try:
                            if rain and str(rain).strip():
                                rainfall += float(rain)
                        except (ValueError, TypeError):
                            logger.warning(f'Invalid rainfall value received: {rain}')
                    logger.debug('Total Rainfall:' + str(rainfall))
                    reading.rain = round(rainfall, 1)
                    reading.save()
                else:
                    logger.debug('No previous reading for site so cannot calculate a rain reading')
        elif kwargs['purpose'] == 'generate_eoy_data':
            rain_data = {} # Keyed by the weatherstation code and the value will be the sum of rain / 10 years
            start_dates = [] # 10 start dates starting at the 1st October of current year. Actually 2nd cause of the way API works

            season = Season.objects.get(current_flag=True)
            current_year = season.formatted_season_start_year
            current_year_date = str(current_year) + '-10-02'
            start_dates.append(current_year_date)

            station = kwargs['stations']
            logger.debug("Generating average rainfall for last 10 years back from " + current_year_date + " for station " + station)

            for month in ['10','11','12','01','02','03','04','05']:
                rain_data[month] = {
                    'avg' : 0,
                    'cur' : 0
                }

            x = 0
            while x < 10:
                year = (int(current_year) -1) - x
                # Start Date will always be 1st of October of year we got for current.
                date = str(year) + '-10-02'
                start_dates.append(date)
                x = x + 1
            logger.debug('We will be getting rainfall data for ' + str(start_dates) + ' + 242 days')

            # We will have the current year, and the previous 10 years in array
            for start_date in start_dates:
                data = {
                    'start': start_date,
                    'stop': str(reading.date),
                    'station': station
                }
                data = {
                    'period': 242, # 242 days will take us to 31st of May (except leap years but don't need to be exact)
                    'startdate' : start_date,
                    'format' : 'csv',
                    'interval': 'D',
                    'stations': station,
                    'metvars' : 'RN_T'
                }

                response_text = post_request(data, 'RNDATA')

                lines = response_text.split("\n")
                del lines[0]
                for line in lines:
                    valid = re.search("^\w.*", line) # make sure we have a valid line to split
                    if valid:
                        fields = line.split(",")
                        station = fields[0]
                        start = fields[1]
                        split_start = start.split("-") # Split from date "2019-10-17 08:00:00"
                        month = split_start[1] # Month which is the key to our rain_data dict is the second part of date
                        rain = fields[3]
                        if rain != '-' and rain != '.':
                            if start_date == current_year_date:
                                rain_data[month]['cur'] += float(rain)
                            else:
                                rain_data[month]['avg'] += float(rain)
                        else:
                            logger.error("Unidentifiable value for rain of:" + rain)

            return json.dumps(rain_data)
        else:
            logger.error('Unidentified purpose of requesting hortplus data')

'''
    post_request
'''

def post_request(data, metvars):

    api_key = os.getenv('HORTPLUS_METWATCH_API_KEY')
    api_url = settings.METWATCH_API_URL
    api_url = api_url + 'api/legacy/historic/daily?station=' + data["station"] + '&start=' + data["start"]  + '&stop=' + data["stop"]
    headers = {
        "X-Api-Key": api_key,
        "Accept":"application/json"}
    logger.debug(str(headers))
    logger.debug(api_url)
    r = requests.get(api_url, headers=headers)
    logger.debug('data in request ' + str(r))
    if r.status_code == 200:
        ojson = json.loads(r.text)
        #logger.debug('response ' + ojson)
        return ojson[metvars]
    else:
        raise Exception("Error processing request:" + str(r.text))
