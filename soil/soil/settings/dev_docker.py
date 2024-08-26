from ._base import *

DEBUG = True

SOIL_DB_HOST = get_env_variable('SOIL_DB_HOST')

LOGLEVEL = "debug"

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': SOIL_DB_NAME,
        'USER': SOIL_DB_USER,
        'PASSWORD': SOIL_DB_PASSWORD,
        'HOST': SOIL_DB_HOST,
        'PORT': 5432,
    }
}