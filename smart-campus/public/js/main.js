// Main JavaScript file for Smart Campus Management System

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize application
function initializeApp() {
    setupEventListeners();
    loadDynamicContent();
    initializeRealTimeUpdates();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation active state
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });

    // Auto-dismiss flash messages
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 300);
        }, 5000);
    });

    // Mobile menu toggle (if needed)
    setupMobileMenu();
}

// Handle form submissions
function handleFormSubmit(e) {
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Basic validation
    if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
        return;
    }

    // Show loading state
    if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Processing...';
        
        // Re-enable after 5 seconds if still disabled (fallback)
        setTimeout(() => {
            if (submitBtn.disabled) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }, 5000);
    }
}

// Setup mobile menu
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
}

// Load dynamic content
function loadDynamicContent() {
    // Load queue status if on cafeteria page
    if (window.location.pathname.includes('cafeteria')) {
        loadQueueStatus();
        setInterval(loadQueueStatus, 30000); // Update every 30 seconds
    }

    // Load upcoming events if on dashboard
    if (window.location.pathname === '/dashboard') {
        loadUpcomingEvents();
    }

    // Initialize any charts or maps
    initializeCharts();
}

// Load queue status
async function loadQueueStatus() {
    try {
        const response = await fetch('/cafeteria/queue/status');
        const data = await response.json();
        
        if (data.success) {
            updateQueueDisplay(data.data);
        }
    } catch (error) {
        console.error('Error loading queue status:', error);
    }
}

// Update queue display
function updateQueueDisplay(queueData) {
    const queueElement = document.getElementById('queue-status');
    if (queueElement) {
        queueElement.innerHTML = `
            <div class="queue-status queue-${queueData.crowdColor}">
                <h3>${queueData.crowdStatus}</h3>
                <p>${queueData.message}</p>
                <p>Current: ${queueData.currentCount} / ${queueData.maxCapacity}</p>
                <p>Estimated wait: ${queueData.estimatedWaitTime} minutes</p>
            </div>
        `;
    }
}

// Load upcoming events
async function loadUpcomingEvents() {
    try {
        const response = await fetch('/api/calendar/upcoming');
        const data = await response.json();
        
        if (data.success) {
            displayUpcomingEvents(data.data);
        }
    } catch (error) {
        console.error('Error loading upcoming events:', error);
    }
}

// Display upcoming events
function displayUpcomingEvents(events) {
    const eventsContainer = document.getElementById('upcoming-events');
    if (eventsContainer && events.length > 0) {
        eventsContainer.innerHTML = events.map(event => `
            <div class="card event-card event-upcoming">
                <h4>${event.title}</h4>
                <p>${formatDate(event.startDate)}</p>
                <p>${event.type}</p>
            </div>
        `).join('');
    }
}

// Initialize real-time updates
function initializeRealTimeUpdates() {
    // WebSocket or polling for real-time updates can be implemented here
    // For now, using simple polling for queue status
}

// Initialize charts (for admin dashboard)
function initializeCharts() {
    const chartContainers = document.querySelectorAll('.chart-container');
    if (chartContainers.length > 0) {
        // Load Chart.js if needed and initialize charts
        loadChartJS().then(() => {
            chartContainers.forEach(container => {
                const chartType = container.dataset.chartType;
                initializeChart(container, chartType);
            });
        });
    }
}

// Load Chart.js dynamically
async function loadChartJS() {
    if (typeof Chart === 'undefined') {
        await import('https://cdn.jsdelivr.net/npm/chart.js');
    }
    return true;
}

// Initialize specific chart
function initializeChart(container, chartType) {
    // Chart initialization logic would go here
    // This is a placeholder for actual chart implementation
    console.log(`Initializing ${chartType} chart in`, container);
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Utility function to format time
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality
function setupSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce((e) => {
            performSearch(e.target.value, e.target.dataset.searchType);
        }, 300));
    });
}

// Perform search
async function performSearch(query, searchType) {
    if (query.length < 2) return;
    
    try {
        const response = await fetch(`/api/search/${searchType}?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success) {
            displaySearchResults(data.results, searchType);
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Display search results
function displaySearchResults(results, searchType) {
    const resultsContainer = document.getElementById(`search-results-${searchType}`);
    if (resultsContainer) {
        resultsContainer.innerHTML = results.map(result => `
            <div class="search-result-item">
                <h5>${result.title || result.name}</h5>
                <p>${result.description?.substring(0, 100)}...</p>
            </div>
        `).join('');
    }
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Export functions for global access
window.SmartCampus = {
    formatDate,
    formatTime,
    debounce,
    loadQueueStatus,
    loadUpcomingEvents
};
