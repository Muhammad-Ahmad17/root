FROM nginx:1.27-alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates
COPY certs/cicd.aahmad.app /etc/letsencrypt/live/cicd.aahmad.app

# Expose ports
EXPOSE 80 443

# Verify certificates are copied (optional - for debugging)
RUN ls -la /etc/letsencrypt/live/cicd.aahmad.app/
