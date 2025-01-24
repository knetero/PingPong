FROM python:3.9-bullseye
RUN pip install --upgrade pip
ENV PIP_ROOT_USER_ACTION=ignore
WORKDIR /app
# RUN apt-get update && apt-get install -y nginx openssl curl systemctl\
#     && rm -rf /var/lib/apt/lists/*
# RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#     -keyout nginx.key -out nginx.crt \
#     -subj "/C=US/ST=State/L=City/O=Organization/OU=Department/CN=localhost"
# COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir backend
COPY . backend/
RUN chmod +x /app/backend/run.sh
ENTRYPOINT ["/app/backend/run.sh"]
# CMD ["nginx", "-g", "daemon off;"]
# CMD ["python", "/app/backend/manage.py", "runserver"]