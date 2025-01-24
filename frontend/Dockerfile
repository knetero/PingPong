FROM node:18-bullseye
WORKDIR /app
RUN mkdir frontend/
WORKDIR /app/frontend
RUN chown -R root:root /app/frontend
COPY . .
RUN chmod +x /app/frontend/run.sh
ENTRYPOINT ["./run.sh"]
# CMD ["npm", "run", "dev"]