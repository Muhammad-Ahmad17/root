FROM nginx:1.27-alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates baked in from GitHub Actions secrets
COPY certs/cicd.aahmad.app /etc/letsencrypt/live/cicd.aahmad.app

# Verify certificates are present at build time
RUN ls -la /etc/letsencrypt/live/cicd.aahmad.app/

EXPOSE 80 443
