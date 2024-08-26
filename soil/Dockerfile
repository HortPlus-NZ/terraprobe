# Use Ubuntu as the base image
FROM ubuntu:20.04

# Build arguments
ARG DJANGO_SETTINGS_MODULE
ARG DJANGO_SECRET_KEY
ARG HORTPLUS_JACK_KEY
ARG SOIL_DB_PASSWORD
ARG SOIL_DB_USER
ARG SOIL_DB_NAME
ARG SOIL_DB_HOST
ARG HORTPLUS_API_KEY
ARG HORTPLUS_METWATCH_API_KEY
ARG PROPERTIES_API_URL
ARG METWATCH_API_URL

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Set environment variables
ENV LANG en_NZ.UTF-8
ENV LC_ALL en_NZ.UTF-8
ENV LANGUAGE en_NZ:en
ENV TZ=Pacific/Auckland
ENV PYTHONUNBUFFERED 1
# Set build argument envs
ENV DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE}
ENV DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
ENV HORTPLUS_JACK_KEY=${HORTPLUS_JACK_KEY}
ENV SOIL_DB_PASSWORD=${SOIL_DB_PASSWORD}
ENV SOIL_DB_USER=${SOIL_DB_USER}
ENV SOIL_DB_NAME=${SOIL_DB_NAME}
ENV SOIL_DB_HOST=${SOIL_DB_HOST}
ENV HORTPLUS_API_KEY=${HORTPLUS_API_KEY}
ENV HORTPLUS_METWATCH_API_KEY=${HORTPLUS_METWATCH_API_KEY}
ENV PROPERTIES_API_URL=${PROPERTIES_API_URL}
ENV METWATCH_API_URL=${METWATCH_API_URL}
# ENV PROPERTIES_API_URL 'https://staging.api.properties.metwatch.nz/'
# ENV METWATCH_API_URL 'https://staging.api.metwatch.nz/'

# Install basic utilities and packages
RUN apt-get update && apt-get install -y \
    git \
    nginx \
    certbot \
    python3.8 \
    python3.8-dev \
    python3.8-venv \
    python3-pip \
    libpcre3-dev \
    ssl-cert \
    tzdata \
    unzip \
    locales \
    wget \
    gnupg2 \
    lsb-release

# Set up locale
RUN locale-gen en_NZ.UTF-8 && update-locale LANG=en_NZ.UTF-8 LC_ALL=en_NZ.UTF-8

# Set timezone
RUN ln -fs /usr/share/zoneinfo/Pacific/Auckland /etc/localtime && dpkg-reconfigure -f noninteractive tzdata

# Set up Python 3.8 as the default python3 and python
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.8 1
RUN update-alternatives --set python3 /usr/bin/python3.8
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Upgrade pip
RUN python3.8 -m pip install --upgrade pip

# Install psycopg2 dependencies
RUN apt-get install -y libpq-dev

# Set up project directory
WORKDIR /app

# Copy requirements files
COPY soil/requirements /app/requirements

# Install Python dependencies
RUN pip install -r /app/requirements/dev.txt

# Copy project files
COPY soil /app

# Set up Nginx
RUN rm /etc/nginx/sites-enabled/default
COPY soil/config/nginx_docker.conf /etc/nginx/conf.d/app.conf

# Copy uWSGI configuration
COPY soil/config/uwsgi_docker.ini /app/uwsgi.ini


# Expose port
EXPOSE 8000 8443

# Start Nginx and uWSGI
CMD service nginx start && uwsgi --ini /app/uwsgi.ini