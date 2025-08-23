// Google Maps API Configuration
const googleMapsConfig = {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    defaultCenter: {
        lat: 40.7128, // Default center (New York City)
        lng: -74.0060
    },
    defaultZoom: 15,
    mapStyles: [
        {
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#444444"}]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{"color": "#f2f2f2"}]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{"visibility": "off"}]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{"saturation": -100}, {"lightness": 45}]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{"visibility": "simplified"}]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{"visibility": "off"}]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{"visibility": "off"}]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
        }
    ]
};

module.exports = googleMapsConfig;
