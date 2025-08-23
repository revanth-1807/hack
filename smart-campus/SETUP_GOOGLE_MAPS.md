# Google Maps API Setup Guide

This guide will help you set up the Google Maps API for your Smart Campus application.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project (Google Maps API requires billing to be enabled)

## Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud Console:

1. **Maps JavaScript API** - For displaying the interactive map
2. **Places API** - For search functionality
3. **Directions API** - For getting directions between locations
4. **Geocoding API** - For converting addresses to coordinates (optional but recommended)

## Step 3: Create API Key

1. Go to "Credentials" in your Google Cloud Console
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key

## Step 4: Configure API Key Restrictions (Recommended)

For security, restrict your API key:

1. **Application restrictions**: Choose "HTTP referrers"
2. **Website restrictions**: Add your domain (e.g., `http://localhost:3001/*`, `https://yourdomain.com/*`)
3. **API restrictions**: Restrict key to:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API

## Step 5: Add API Key to Environment

Add your Google Maps API key to the `.env` file:

```bash
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## Step 6: Test the Configuration

1. Start your application: `npm start` or `node server.js`
2. Navigate to the Campus Map page
3. The Google Maps should load with building markers

## Troubleshooting

### Common Issues:

1. **"This page can't load Google Maps correctly"**
   - Check if API key is valid and properly restricted
   - Verify required APIs are enabled

2. **Map not loading**
   - Check browser console for errors
   - Ensure API key is set in environment variables

3. **Search not working**
   - Verify Places API is enabled
   - Check API key restrictions

4. **Directions not working**
   - Verify Directions API is enabled
   - Check billing is set up correctly

### Required APIs:
- Maps JavaScript API
- Places API
- Directions API
- Geocoding API (recommended)

### Cost Considerations:
- Google Maps APIs have free usage tiers
- Monitor usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges

## Security Best Practices

1. **Restrict API keys** to specific domains and APIs
2. **Use environment variables** instead of hardcoding keys
3. **Rotate API keys** regularly
4. **Monitor usage** in Google Cloud Console

## Additional Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Best Practices](https://developers.google.com/maps/api-key-best-practices)

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all required APIs are enabled
3. Ensure billing is properly set up
4. Check API key restrictions match your domain

For additional help, refer to Google's [Maps JavaScript API documentation](https://developers.google.com/maps/documentation/javascript).
