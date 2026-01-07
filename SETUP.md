# Quick Setup Guide

## For Development (Local Testing)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - The `.env` file is already set up for local development
   - If needed, update `.env` with your ServiceNow credentials

3. **Run the app:**
   ```bash
   npm run web
   ```

4. **Access the app:**
   - Open your browser to `http://localhost:8081`

## For Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production deployment instructions.

### Quick Production Setup:

1. **On your VM, clone/copy the project**

2. **Set up environment:**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your production settings
   ```

3. **Update your production `.env`:**
   ```
   SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com
   SERVICENOW_USERNAME=Visitor Log API
   SERVICENOW_PASSWORD=YourProductionPassword
   SERVICENOW_TABLE_NAME=u_visitor_log
   APP_DOMAIN=https://visitor.yourcompany.com
   ```

4. **Build for production:**
   ```bash
   npm install
   npm run build:web
   ```

5. **Deploy the `dist/` folder** to your web server (nginx/Apache)

6. **Update ServiceNow CORS** to allow your production domain

That's it! See DEPLOYMENT.md for detailed web server configuration.

## Configuration Files

- **`.env`** - Environment variables (NOT committed to git)
- **`.env.example`** - Template for environment variables
- **`config.ts`** - Reads from .env and provides configuration
- **`DEPLOYMENT.md`** - Detailed production deployment guide

## Important Notes

- Never commit `.env` to git (it's in .gitignore)
- Always use HTTPS in production
- Update ServiceNow CORS settings when changing domains
- The app will use default values if .env variables are not set
