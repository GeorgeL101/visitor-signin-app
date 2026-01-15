# Dev Admin UI Guide

## Overview
The Dev Admin UI allows you to easily modify the visitor sign-in app configuration without editing code directly. All changes are written back to source files and include automatic version tracking.

## Quick Start

### 1. Start the Dev Server
```bash
npm run dev-server
```

The admin UI will be available at: **http://localhost:3001**

### 2. Access the Admin Interface
Open your browser and navigate to `http://localhost:3001`

### 3. Make Changes
You can modify:
- **App Settings**: Title, subtitle, button text
- **Form Fields**: Labels, placeholders, order, required status
- **ServiceNow Settings**: Instance URL, credentials, table name
- **Messages**: Error messages, status text

### 4. Save Configuration
1. Add a description of your changes
2. Select version increment type:
   - **Patch (1.0.X)**: Bug fixes, minor text changes
   - **Minor (1.X.0)**: New features, field additions
   - **Major (X.0.0)**: Breaking changes, major restructuring
3. Click "Save Configuration"

## What Gets Updated

When you save changes through the admin UI:

1. **config/formConfig.json** - All configuration changes are written here
2. **package.json** - Version number is automatically updated
3. **Version History** - A new entry is added with timestamp and description

## Version Control

The system uses semantic versioning:
- **Major.Minor.Patch** (e.g., 1.2.3)
- Version history is tracked in `formConfig.json`
- Each save creates a new version entry with timestamp

## Production Deployment

When you're ready to deploy to production:

1. Make and test your changes in the dev admin UI
2. The changes are already in your source files (config/formConfig.json)
3. Zip or deliver the updated files to your web dev
4. The version number will be displayed in the production app

## Files Structure

```
visitor-signin-app/
├── config/
│   └── formConfig.json          # Configuration data (auto-updated)
├── admin/
│   └── index.html               # Admin UI interface
├── utils/
│   └── configLoader.ts          # Config loader utility
├── dev-server.js                # Express server for admin UI
└── App.tsx                      # Main app (reads from config)
```

## Important Notes

- The dev server only runs on your VM and is not deployed to production
- All changes persist to source files immediately
- The main app automatically uses the latest configuration
- Always test changes before deploying to production
- Version numbers are automatically incremented on save

## Troubleshooting

### Admin UI won't load
- Make sure `npm run dev-server` is running
- Check that port 3001 is not in use
- Try `http://localhost:3001` in your browser

### Changes not appearing in main app
- Stop and restart the main app (`npm start`)
- Make sure `config/formConfig.json` was updated
- Check browser console for errors

### Version not incrementing
- Ensure you selected a version increment type before saving
- Check that `package.json` has write permissions

## Support

If you encounter issues, check:
1. Node.js and npm are installed
2. All dependencies are installed (`npm install`)
3. No port conflicts on 3001
4. Files have proper write permissions
