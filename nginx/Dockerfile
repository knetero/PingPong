FROM debian:10
WORKDIR /app
RUN apt-get update && apt-get install -y nginx openssl \
    && rm -rf /var/lib/apt/lists/*
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /app/nginx.key -out /app/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=Department/CN=10.13.7.8"
COPY default.conf /etc/nginx/nginx.conf
RUN mkdir -p /var/www/frontend/
# RUN chown -R nginx:nginx /var/www/frontend
RUN chmod -R 755 /var/www/frontend
RUN cp /app/nginx.key /etc/nginx/
RUN cp /app/nginx.crt /etc/nginx/
RUN chmod 600 /etc/nginx/nginx.key /etc/nginx/nginx.crt
RUN mkdir -p /var/www/frontend
EXPOSE 443
# RUN cp nginx.crt /etc/ssl/certs/nginx.crt
# RUN cp nginx.key /etc/ssl/private/nginx.key
CMD ["nginx", "-g", "daemon off;"]