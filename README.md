# Visitor Sign-In App

A React Native/Expo app for iPad/iPhone that allows visitors to sign in at retirement homes or other facilities. The app captures visitor information and signatures, then submits them directly to your ServiceNow instance via API.

## Features

- ✅ Touch and Apple Pencil signature capture
- ✅ Visitor information form (name, visiting whom, purpose, phone)
- ✅ Direct integration with ServiceNow REST API
- ✅ Signature saved as JPEG/PNG attachment
- ✅ Works on iPad and iPhone
- ✅ Clean, user-friendly interface
- ✅ Offline-capable (can queue submissions)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- ServiceNow instance with API access
- iOS device (iPad or iPhone) for testing/deployment
- Expo Go app (for testing) or Expo account (for building)

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd visitor-signin-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure ServiceNow credentials:**
   ```bash
   # Copy the example config file
   cp config.example.ts config.ts
   ```
   
   Then edit `config.ts` and add your ServiceNow credentials:
   ```typescript
   export const SERVICE_NOW_CONFIG = {
     instanceUrl: 'https://your-instance.service-now.com',
     username: 'your_username',
     password: 'your_password',
     tableName: 'u_visitor_log',
   };
   ```

   **Important:** The `config.ts` file is gitignored to keep your credentials secure.

## ServiceNow Setup

### 1. Create Custom Table

In your ServiceNow instance, create a custom table called `u_visitor_log` with the following fields:

| Field Name | Type | Label |
|------------|------|-------|
| u_visitor_name | String | Visitor Name |
| u_visiting_person | String | Visiting Person |
| u_purpose | String | Purpose |
| u_phone_number | String | Phone Number |
| u_sign_in_time | Date/Time | Sign-In Time |

### 2. Enable API Access

1. Navigate to **System Web Services** > **REST** > **REST API Explorer**
2. Ensure your user account has the following roles:
   - `rest_api_explorer`
   - `web_service_admin` (or appropriate API access role)
3. Test API access by making a GET request to your table

### 3. Configure Attachments

The app uses the ServiceNow Attachment API to upload visitor signatures. Ensure attachments are enabled for your custom table:
1. Go to your table definition
2. Check "Allow Attachments" option
3. Save the configuration

## Development

### Testing on Your Device

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Run on iOS device using Expo Go:**
   - Install Expo Go from the App Store on your iPad/iPhone
   - Scan the QR code shown in the terminal
   - The app will load on your device

### Testing on Simulator (requires Mac)

```bash
npm run ios
```

## Building for Production

### Option 1: Build with Expo (Recommended)

1. **Create an Expo account** at https://expo.dev

2. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

3. **Configure your project:**
   ```bash
   eas build:configure
   ```

4. **Build for iOS:**
   ```bash
   eas build --platform ios
   ```

5. **Follow the prompts** to create credentials and submit to App Store or install directly

### Option 2: TestFlight Distribution

After building with EAS, you can distribute via TestFlight:

```bash
eas submit --platform ios
```

This will submit your app to TestFlight for internal testing.

## Project Structure

```
visitor-signin-app/
├── App.tsx                      # Main app component with form
├── types.ts                     # TypeScript interfaces
├── config.example.ts            # Configuration template
├── components/
│   ├── SignaturePad.tsx        # Signature capture component
│   └── SuccessScreen.tsx       # Success confirmation screen
├── services/
│   └── serviceNowAPI.ts        # ServiceNow API integration
├── package.json
└── README.md
```

## How It Works

1. **Visitor fills out form** with their information
2. **Visitor signs** using finger or Apple Pencil on the iPad
3. **App validates** all fields are completed
4. **App submits to ServiceNow:**
   - Creates a new record in `u_visitor_log` table
   - Uploads signature as PNG attachment to that record
5. **Success screen** is displayed, allowing sign-in of another visitor

## API Integration Details

The app uses two ServiceNow REST API endpoints:

### 1. Table API (Create Record)
```
POST https://your-instance.service-now.com/api/now/table/u_visitor_log
```
Headers:
- `Authorization: Basic <base64_credentials>`
- `Content-Type: application/json`

### 2. Attachment API (Upload Signature)
```
POST https://your-instance.service-now.com/api/now/attachment/upload?table_name=u_visitor_log&table_sys_id=<record_id>&file_name=visitor_signature.png
```
Headers:
- `Authorization: Basic <base64_credentials>`
- `Content-Type: image/png`

## Troubleshooting

### Issue: "Failed to create record"
- Check ServiceNow credentials in `config.ts`
- Verify user has API access permissions
- Check table name matches your ServiceNow configuration

### Issue: "Failed to upload signature"
- Ensure attachments are enabled on your table
- Check network connectivity
- Verify the record was created successfully first

### Issue: Signature not capturing
- Make sure WebView is working (required by signature-canvas)
- Test on actual device, not just simulator

### Issue: Can't build for iOS
- Use Expo EAS Build service (no Mac required)
- Or use a cloud Mac service like MacStadium

## Security Considerations

- **Never commit `config.ts`** - it's gitignored for security
- Consider using OAuth instead of Basic Auth for production
- Use HTTPS for all ServiceNow communications
- Implement proper error handling for network failures
- Consider adding offline queue for submissions

## Future Enhancements

- [ ] Add photo capture feature
- [ ] Implement offline queue with local storage
- [ ] Add sign-out functionality
- [ ] Support multiple languages
- [ ] Add kiosk mode (prevent exiting app)
- [ ] Add admin panel for viewing recent sign-ins

## Support

For issues or questions:
1. Check the ServiceNow API documentation
2. Review Expo documentation at https://docs.expo.dev
3. Test API endpoints using Postman or curl first

## License

MIT License - feel free to use and modify for your needs.
