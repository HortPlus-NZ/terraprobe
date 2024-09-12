from ._base import *

DEBUG = True

SOIL_DB_HOST = get_env_variable('SOIL_DB_HOST')

LOGLEVEL = "debug"

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

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