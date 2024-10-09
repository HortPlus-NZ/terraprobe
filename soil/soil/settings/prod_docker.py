from ._base import *

SOIL_DB_HOST = get_env_variable('SOIL_DB_HOST')

PROPERTIES_API_URL = 'https://api.properties.hortplus.com/'
METWATCH_API_URL = 'https://api.metwatch.nz/'

DEBUG = False

SECURE_SSL_REDIRECT = True
CSRF_COOKIE_SECURE = True
CORS_ORIGIN_ALLOW_ALL = True

LOGLEVEL = os.environ.get('LOGLEVEL', 'info').upper()

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
