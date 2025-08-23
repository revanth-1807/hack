// Google Maps initialization and functionality
class CampusMap {
    constructor(apiKey, mapElementId, options = {}) {
        this.apiKey = apiKey;
        this.mapElementId = mapElementId;
        this.options = options;
        this.map = null;
        this.markers = [];
        this.infoWindows = [];
        this.directionsService = null;
        this.directionsRenderer = null;
        this.currentLocationMarker = null;
    }

    // Initialize Google Maps
    async init() {
        if (!this.apiKey) {
            console.error('Google Maps API key is required');
            return;
        }

        // Load Google Maps script
        await this.loadGoogleMaps();

        // Initialize map
        this.initMap();
        
        // Initialize directions service
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer();
        this.directionsRenderer.setMap(this.map);
    }

    // Load Google Maps script
    loadGoogleMaps() {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Initialize the map
    initMap() {
        const mapOptions = {
            center: this.options.center || { lat: 40.7128, lng: -74.0060 },
            zoom: this.options.zoom || 15,
            styles: this.options.styles || [],
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true
        };

        this.map = new google.maps.Map(document.getElementById(this.mapElementId), mapOptions);
    }

    // Add markers for buildings
    addBuildingMarkers(buildings) {
        this.clearMarkers();

        buildings.forEach(building => {
            const marker = new google.maps.Marker({
                position: building.coordinates,
                map: this.map,
                title: building.name,
                icon: this.getMarkerIcon(building.category),
                animation: google.maps.Animation.DROP
            });

            const infoWindow = new google.maps.InfoWindow({
                content: this.getInfoWindowContent(building)
            });

            marker.addListener('click', () => {
                // Close all other info windows
                this.infoWindows.forEach(iw => iw.close());
                infoWindow.open(this.map, marker);
                
                // Center map on marker
                this.map.panTo(marker.getPosition());
                this.map.setZoom(17);
            });

            this.markers.push(marker);
            this.infoWindows.push(infoWindow);
        });
    }

    // Get marker icon based on building category
    getMarkerIcon(category) {
        const icons = {
            academic: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            administrative: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            residential: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
            recreational: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
            library: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            cafeteria: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
            sports: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png'
        };

        return icons[category] || 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }

    // Get info window content for a building
    getInfoWindowContent(building) {
        return `
            <div class="building-info-window">
                <h3>${building.name}</h3>
                <p><strong>Code:</strong> ${building.code}</p>
                <p><strong>Type:</strong> ${building.category}</p>
                ${building.description ? `<p>${building.description}</p>` : ''}
                ${building.address && building.address.street ? `
                    <p><strong>Address:</strong> ${building.address.street}</p>
                ` : ''}
                <div style="margin-top: 10px;">
                    <a href="/navigation/building/${building.id}" class="btn btn-sm btn-primary">
                        View Details
                    </a>
                    <button onclick="campusMap.getDirectionsToBuilding('${building.id}')" 
                            class="btn btn-sm btn-success">
                        Get Directions
                    </button>
                </div>
            </div>
        `;
    }

    // Clear all markers
    clearMarkers() {
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
        this.infoWindows = [];
    }

    // Get current location
    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(location);
                },
                error => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

    // Add current location marker
    addCurrentLocationMarker(position) {
        if (this.currentLocationMarker) {
            this.currentLocationMarker.setMap(null);
        }

        this.currentLocationMarker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: 'Your Current Location',
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            },
            animation: google.maps.Animation.BOUNCE
        });

        // Center map on current location
        this.map.panTo(position);
        this.map.setZoom(16);
    }

    // Get directions to a building
    async getDirectionsToBuilding(buildingId, travelMode = 'WALKING') {
        try {
            const currentLocation = await this.getCurrentLocation();
            this.addCurrentLocationMarker(currentLocation);

            // Find building by ID
            const building = window.buildingData.find(b => b.id === buildingId);
            if (!building) {
                alert('Building not found');
                return;
            }

            const request = {
                origin: currentLocation,
                destination: building.coordinates,
                travelMode: google.maps.TravelMode[travelMode]
            };

            this.directionsService.route(request, (result, status) => {
                if (status === 'OK') {
                    this.directionsRenderer.setDirections(result);
                    
                    // Show directions panel
                    const directionsPanel = document.getElementById('directions-panel');
                    if (directionsPanel) {
                        directionsPanel.style.display = 'block';
                        directionsPanel.innerHTML = '';
                        
                        const route = result.routes[0];
                        for (let i = 0; i < route.legs[0].steps.length; i++) {
                            const step = route.legs[0].steps[i];
                            directionsPanel.innerHTML += `
                                <p>${i + 1}. ${step.instructions}</p>
                            `;
                        }
                    }
                } else {
                    alert('Could not get directions: ' + status);
                }
            });
        } catch (error) {
            console.error('Error getting directions:', error);
            alert('Could not get your current location. Please ensure location services are enabled.');
        }
    }

    // Search for locations
    initSearchBox(inputElementId) {
        const input = document.getElementById(inputElementId);
        if (!input) return;

        const searchBox = new google.maps.places.SearchBox(input);

        searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            if (places.length === 0) return;

            const place = places[0];
            if (!place.geometry) return;

            // Center map on the selected place
            this.map.panTo(place.geometry.location);
            this.map.setZoom(17);

            // Add a marker for the searched place
            new google.maps.Marker({
                map: this.map,
                title: place.name,
                position: place.geometry.location
            });
        });
    }
}

// Global campus map instance
let campusMap;

// Initialize campus map when Google Maps is loaded
function initCampusMap() {
    const mapElement = document.getElementById('campus-map');
    if (!mapElement) return;

    campusMap = new CampusMap(
        window.googleMapsApiKey,
        'campus-map',
        {
            center: window.mapCenter ? JSON.parse(window.mapCenter) : { lat: 40.7128, lng: -74.0060 },
            zoom: window.mapZoom || 15,
            styles: window.mapStyles ? JSON.parse(window.mapStyles) : []
        }
    );

    campusMap.init().then(() => {
        // Add building markers if data is available
        if (window.buildingData) {
            const buildings = JSON.parse(window.buildingData);
            campusMap.addBuildingMarkers(buildings);
        }

        // Initialize search box
        campusMap.initSearchBox('map-search-input');

        console.log('Campus map initialized successfully');
    }).catch(error => {
        console.error('Failed to initialize campus map:', error);
    });
}

// Expose functions to global scope for HTML onclick handlers
window.getDirectionsToBuilding = (buildingId) => {
    if (campusMap) {
        campusMap.getDirectionsToBuilding(buildingId);
    }
};

window.showCurrentLocation = () => {
    if (campusMap) {
        campusMap.getCurrentLocation()
            .then(position => {
                campusMap.addCurrentLocationMarker(position);
            })
            .catch(error => {
                alert('Could not get your current location: ' + error.message);
            });
    }
};

// Initialize when Google Maps is ready
if (typeof google !== 'undefined' && google.maps) {
    initCampusMap();
} else {
    window.initCampusMap = initCampusMap;
}
