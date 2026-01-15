const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('admin'));

// Paths
const CONFIG_PATH = path.join(__dirname, 'config', 'formConfig.json');
const PACKAGE_PATH = path.join(__dirname, 'package.json');

// Helper function to increment version
function incrementVersion(version, type = 'patch') {
  const parts = version.split('.').map(Number);
  
  switch(type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2]++;
      break;
  }
  
  return parts.join('.');
}

// API Endpoints

// Get current configuration
app.get('/api/config', (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    res.json(config);
  } catch (error) {
    console.error('Error reading config:', error);
    res.status(500).json({ error: 'Failed to read configuration' });
  }
});

// Save configuration
app.post('/api/config', (req, res) => {
  try {
    const newConfig = req.body;
    const currentConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    
    // Auto-increment version
    const versionType = req.body.versionType || 'patch';
    const newVersion = incrementVersion(currentConfig.version, versionType);
    
    // Update version and add to history
    newConfig.version = newVersion;
    newConfig.versionHistory = currentConfig.versionHistory || [];
    newConfig.versionHistory.push({
      version: newVersion,
      timestamp: new Date().toISOString(),
      changes: req.body.changeDescription || 'Configuration update'
    });
    
    // Write to config file
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
    
    // Update package.json version
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(PACKAGE_PATH, JSON.stringify(packageJson, null, 2));
    
    console.log(`Configuration saved. Version updated to ${newVersion}`);
    res.json({ 
      success: true, 
      version: newVersion,
      message: 'Configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving config:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// Get version history
app.get('/api/version-history', (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    res.json(config.versionHistory || []);
  } catch (error) {
    console.error('Error reading version history:', error);
    res.status(500).json({ error: 'Failed to read version history' });
  }
});

// Increment version manually
app.post('/api/version/increment', (req, res) => {
  try {
    const { type } = req.body; // major, minor, or patch
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
    
    const newVersion = incrementVersion(config.version, type);
    
    config.version = newVersion;
    packageJson.version = newVersion;
    
    config.versionHistory = config.versionHistory || [];
    config.versionHistory.push({
      version: newVersion,
      timestamp: new Date().toISOString(),
      changes: `Manual ${type} version increment`
    });
    
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    fs.writeFileSync(PACKAGE_PATH, JSON.stringify(packageJson, null, 2));
    
    res.json({ success: true, version: newVersion });
  } catch (error) {
    console.error('Error incrementing version:', error);
    res.status(500).json({ error: 'Failed to increment version' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Dev Admin Server Running`);
  console.log(`========================================`);
  console.log(`Admin UI: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`========================================\n`);
});
