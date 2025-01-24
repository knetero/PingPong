#!/bin/bash
# cp /app/nginx.crt /etc/ssl/certs/nginx.crt
# cp /app/nginx.key /etc/ssl/private/nginx.key
# echo "10.13.7.8   Pong-Game-1337" >> /etc/hosts
python3 -m venv ../myenv
# docker-compose up -d
touch .env
bash -c "source ../myenv/bin/activate "
pip install -r /app/backend/requirements.txt
# systemctl start nginx
python /app/backend/manage.py runserver 0.0.0.0:8000