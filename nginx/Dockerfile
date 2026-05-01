FROM nginx:1.27-alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates (from your local certs directory to container)
COPY certs/cicd.aahmad.app /etc/letsencrypt/live/cicd.aahmad.app

# Expose ports
EXPOSE 80 443

# Verify certificates are copied (optional build-time check)
RUN ls -la /etc/letsencrypt/live/cicd.aahmad.app/
