#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE soil;
    CREATE USER soiladmin WITH PASSWORD 'soiladmin';
    GRANT ALL PRIVILEGES ON DATABASE soil TO soiladmin;
    ALTER USER soiladmin CREATEDB;
EOSQL