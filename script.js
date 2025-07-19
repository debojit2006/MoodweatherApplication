document.addEventListener('DOMContentLoaded', () => {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const resultContainer = document.getElementById('result-container');
    const loader = document.getElementById('loader');
    const weatherInfoDiv = document.getElementById('weather-info');
    const suggestionInfoDiv = document.getElementById('suggestion-info');
    const errorInfoDiv = document.getElementById('error-info');

    // The URL of our Java backend. Make sure the port matches.
    const API_BASE_URL = 'http://localhost:8080';

    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mood = button.getAttribute('data-mood');
            fetchSuggestion(mood);
        });
    });

    function fetchSuggestion(mood) {
        // Show the result container and the loader
        resultContainer.classList.remove('hidden');
        loader.classList.remove('hidden');
        weatherInfoDiv.innerHTML = '';
        suggestionInfoDiv.innerHTML = '';
        errorInfoDiv.innerHTML = '';

        // 1. Get user's location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // 2. Location found, call our backend
                callBackendAPI(mood, latitude, longitude);
            },
            (error) => {
                // Handle errors with geolocation
                showError('Could not get your location. Please allow location access and try again.');
            }
        );
    }

    async function callBackendAPI(mood, lat, lon) {
        try {
            // 3. Fetch data from our Spring Boot server
            const response = await fetch(`${API_BASE_URL}/api/suggestion?mood=${mood}&lat=${lat}&lon=${lon}`);
            
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();
            
            // 4. Display the results
            displayResults(data);

        } catch (error) {
            console.error('Error fetching suggestion:', error);
            showError('Could not connect to the server. Is it running?');
        }
    }

    function displayResults(data) {
        loader.classList.add('hidden');
        
        if (data.city === 'Error') {
             showError(data.suggestion);
             return;
        }

        weatherInfoDiv.innerHTML = `
            <div class="city">${data.city}</div>
            <div>${Math.round(data.temperature)}°C, ${data.weatherDescription}</div>
        `;
        suggestionInfoDiv.innerHTML = `"${data.suggestion}"`;
    }
    
    function showError(message) {
        loader.classList.add('hidden');
        errorInfoDiv.textContent = message;
    }
});
