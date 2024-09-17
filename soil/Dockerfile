# Use Ubuntu as the base image
FROM ubuntu:20.04

# Build arguments
ARG ENVIRONMENT=dev

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Set environment variables
ENV LANG en_NZ.UTF-8
ENV LC_ALL en_NZ.UTF-8
ENV LANGUAGE en_NZ:en
ENV TZ=Pacific/Auckland
ENV PYTHONUNBUFFERED 1

# Set build argument envs
ENV ENVIRONMENT=${ENVIRONMENT}

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
    lsb-release \
    openssl

# Set up locale
RUN locale-gen en_NZ.UTF-8 && update-locale LANG=en_NZ.UTF-8 LC_ALL=en_NZ.UTF-8

# Set timezone
RUN ln -fs /usr/share/zoneinfo/Pacific/Auckland /etc/localtime && dpkg-reconfigure -f noninteractive tzdata

# Set up Python 3.8 as the default python3 and python
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.8 1
RUN update-alternatives --set python3 /usr/bin/python3.8
RUN ln -sf /usr/bin/python3 /usr/bin/python
RUN python3.8 -m pip install --upgrade pip
RUN apt-get install -y libpq-dev

WORKDIR /app

# Copy requirements files
COPY soil/requirements /app/requirements

# Install Python dependencies based on environment
RUN if [ "$ENVIRONMENT" = "prod" ]; then \
        pip install -r /app/requirements/prod.txt; \
    elif [ "$ENVIRONMENT" = "staging" ]; then \
        pip install -r /app/requirements/staging.txt; \
    else \
        pip install -r /app/requirements/dev.txt; \
    fi

# Install uWSGI
RUN pip install uwsgi

# Create uWSGI log directory
RUN mkdir -p /var/log/uwsgi && chown www-data:www-data /var/log/uwsgi

COPY soil /app

# Set up Nginx
RUN rm /etc/nginx/sites-enabled/default
COPY soil/config/nginx_docker.conf /etc/nginx/conf.d/app.conf

# Copy uWSGI configuration
COPY soil/config/uwsgi_docker_${ENVIRONMENT}.ini /app/uwsgi.ini

# Generate self-signed cert when running locally
RUN if [ "$ENVIRONMENT" = "dev" ]; then \
        mkdir -p /etc/nginx/ssl && \
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt \
        -subj "/C=NZ/ST=Auckland/L=Auckland/O=MyOrganization/OU=MyUnit/CN=localhost"; \
    fi

# Expose ports
EXPOSE 80 443

ENV PYTHONPATH=/app:$PYTHONPATH

# Start Nginx and uWSGI
CMD service nginx start && uwsgi --ini /app/uwsgi.ini