# Deployment Guide

## Production Deployment to VM with Custom Domain

### Prerequisites
- Node.js 18+ installed on the VM
- A web server (nginx or Apache) for serving the built app
- Your custom domain configured with DNS pointing to the VM

### Step 1: Prepare the Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your production settings:
   ```bash
   # ServiceNow Configuration
   SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com
   SERVICENOW_USERNAME=Your Service Account
   SERVICENOW_PASSWORD=YourSecurePassword
   SERVICENOW_TABLE_NAME=u_visitor_log

   # Application Configuration
   APP_DOMAIN=https://visitor.yourcompany.com
   ```

3. **IMPORTANT**: Keep `.env` secure and never commit it to git!

### Step 2: Update ServiceNow CORS Settings

In ServiceNow, navigate to **System Web Services > REST > CORS Rules** and update:
- **Domain**: Add your production domain (e.g., `https://visitor.yourcompany.com`)
- **HTTP methods**: Ensure `GET`, `POST`, `PATCH` are all checked
- **REST API**: Checked

### Step 3: Build the Application

Build the web app for production:

```bash
npm install
npm run build:web
```

This creates optimized production files in the `dist/` directory.

### Step 4: Configure Web Server

#### Option A: Using Nginx

Create nginx configuration (`/etc/nginx/sites-available/visitor-app`):

```nginx
server {
    listen 80;
    server_name visitor.yourcompany.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name visitor.yourcompany.com;
    
    # SSL certificate paths (use Let's Encrypt or your company certs)
    ssl_certificate /etc/ssl/certs/visitor.yourcompany.com.crt;
    ssl_certificate_key /etc/ssl/private/visitor.yourcompany.com.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    root /var/www/visitor-signin-app/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/visitor-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Option B: Using Apache

Create Apache configuration (`/etc/apache2/sites-available/visitor-app.conf`):

```apache
<VirtualHost *:80>
    ServerName visitor.yourcompany.com
    Redirect permanent / https://visitor.yourcompany.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName visitor.yourcompany.com
    DocumentRoot /var/www/visitor-signin-app/dist
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/visitor.yourcompany.com.crt
    SSLCertificateKeyFile /etc/ssl/private/visitor.yourcompany.com.key
    
    <Directory /var/www/visitor-signin-app/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

Enable the site:
```bash
sudo a2ensite visitor-app
sudo a2enmod rewrite ssl
sudo systemctl reload apache2
```

### Step 5: Deploy the Files

1. Copy the built files to your web server:
   ```bash
   sudo mkdir -p /var/www/visitor-signin-app
   sudo cp -r dist/* /var/www/visitor-signin-app/dist/
   ```

2. Set proper permissions:
   ```bash
   sudo chown -R www-data:www-data /var/www/visitor-signin-app
   sudo chmod -R 755 /var/www/visitor-signin-app
   ```

### Step 6: SSL Certificate Setup

#### Using Let's Encrypt (Recommended):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d visitor.yourcompany.com
```

Or for Apache:
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d visitor.yourcompany.com
```

### Step 7: Test the Deployment

1. Visit your domain: `https://visitor.yourcompany.com`
2. Test sign-in functionality
3. Test sign-out functionality
4. Verify records are created in ServiceNow

### Updating the Application

When you need to update the app:

1. Pull latest changes (if using git)
2. Rebuild: `npm run build:web`
3. Deploy: `sudo cp -r dist/* /var/www/visitor-signin-app/dist/`
4. Clear browser cache or do a hard refresh (Ctrl+Shift+R)

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVICENOW_INSTANCE_URL` | Your ServiceNow instance URL | `https://company.service-now.com` |
| `SERVICENOW_USERNAME` | API service account username | `Visitor Log API` |
| `SERVICENOW_PASSWORD` | API service account password | `SecurePassword123!` |
| `SERVICENOW_TABLE_NAME` | Custom table name for visitor logs | `u_visitor_log` |
| `APP_DOMAIN` | Your production domain | `https://visitor.company.com` |

### Troubleshooting

**Issue**: CORS errors in production
- **Solution**: Update ServiceNow CORS rules to include your production domain

**Issue**: 404 errors on page refresh
- **Solution**: Ensure web server is configured for SPA routing (see nginx/Apache configs above)

**Issue**: Can't connect to ServiceNow
- **Solution**: Check firewall rules, verify ServiceNow credentials, ensure network connectivity from VM to ServiceNow

**Issue**: Environment variables not loading
- **Solution**: Ensure `.env` file exists and has correct format, rebuild the app after changing `.env`

### Security Checklist

- [ ] `.env` file is not committed to git
- [ ] SSL/TLS is properly configured
- [ ] ServiceNow credentials use a dedicated service account with minimal permissions
- [ ] CORS is restricted to your specific domain (not using `*`)
- [ ] Firewall rules are configured appropriately
- [ ] Regular backups of the VM are configured
