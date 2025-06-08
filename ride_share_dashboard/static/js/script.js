// Global variables for dashboard state
let hvfhs_license_num = 'HV0003';  // Default to Uber
let selectedDay = 1; // Default to the first day of the month (March 1st)
let selectedWeather = 'FAIR'; // Default to a common weather condition
let lineChart; // For the daily rides chart (Date-based)
let sharedRidesChart; // For the shared rides pie chart (Date-based)
let weatherLineChart; // For the weather-based line chart
let weatherSharedRidesChart; // For weather shared rides chart

// Wait until the DOM is fully loaded before initializing the dashboard
document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard JS is now running!");

    // --- Initialize Top Section (Date-based Analytics) ---
    populateCalendar(); // Populate the March 2025 calendar
    updateDateBasedDashboard(); // Initial load of KPIs and charts for the date section

    // --- Initialize Bottom Section (Weather-based Analytics) ---
    // Fetch and populate weather conditions dropdown; the initial dashboard update
    // for weather will occur after the dropdown is populated.
    populateWeatherDropdown(); 

    // --- Event Listeners ---
    // Event listener for the ride share service selection dropdown (Date-based section)
    // This single dropdown will now control filtering for both sections.
    document.getElementById('rideSelect').addEventListener('change', function() {
        hvfhs_license_num = this.value; // Update the global ride license number
        console.log('Selected ride license number:', hvfhs_license_num); // Log the new global value
        updateDateBasedDashboard(); // Re-fetch and update date-based metrics
        updateWeatherBasedDashboard(); // NEW: Re-fetch and update weather-based metrics with the new ride selection
    });

    // Event listener for the weather condition selection dropdown (Weather-based section)
    document.getElementById('weatherSelect').addEventListener('change', function() {
        selectedWeather = this.value; // Update the global selected weather condition
        console.log('Selected weather condition:', selectedWeather);
        updateWeatherBasedDashboard(); // Re-fetch and update weather-based metrics
    });

    // Initial highlight for the default selectedDay in the calendar
    const firstDayOfMonthWeekday = new Date(2025, 2, 1).getDay(); // March is month 2 (0-indexed)
    // Select the cell corresponding to the default selectedDay (day 1)
    const initialSelectedCell = document.querySelector(`.calendar-cell:not(.empty):nth-child(${selectedDay + firstDayOfMonthWeekday + 1})`);
    if (initialSelectedCell) {
        initialSelectedCell.classList.add('selected'); // Add 'selected' class for styling
    }
});

// Function to populate the calendar for March 2025
function populateCalendar() {
    const calendar = document.getElementById('calendar');
    const totalDays = 31; // March has 31 days
    
    calendar.innerHTML = ''; // Clear any existing calendar content

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const headerRow = document.createElement('div');
    headerRow.className = 'header-row';
    // Create day name headers (Sun, Mon, etc.)
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.textContent = day;
        headerRow.appendChild(dayHeader);
    });
    calendar.appendChild(headerRow);

    // Get the weekday of March 1, 2025 (0 for Sunday, 1 for Monday, etc.)
    const firstDay = new Date(2025, 2, 1).getDay();

    // Add empty cells for days before the 1st of the month to align correctly
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-cell empty';
        calendar.appendChild(emptyCell);
    }

    // Populate calendar cells for each day of March
    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        dayCell.textContent = day;
        dayCell.className = 'calendar-cell';
        // Attach click listener to each day cell
        dayCell.addEventListener('click', () => handleDayClick(day));

        // Highlight the currently selected day
        if (day === selectedDay) {
            dayCell.classList.add('selected');
        }

        calendar.appendChild(dayCell);
    }
}

// Function to handle a click on a calendar day
function handleDayClick(day) {
    // Remove 'selected' class from the previously selected day
    const prevSelectedCell = document.querySelector('.calendar-cell.selected');
    if (prevSelectedCell) {
        prevSelectedCell.classList.remove('selected');
    }

    selectedDay = day; // Update the global selected day

    // Add 'selected' class to the newly clicked day
    const firstDayOfMonthWeekday = new Date(2025, 2, 1).getDay();
    const newSelectedCell = document.querySelector(`.calendar-cell:not(.empty):nth-child(${selectedDay + firstDayOfMonthWeekday + 1})`);
    if (newSelectedCell) {
        newSelectedCell.classList.add('selected');
    }

    updateDateBasedDashboard(); // Trigger update for the date-based section
}

// Function to trigger updates for the Top Section (Date-based) dashboard
function updateDateBasedDashboard() {
    console.log(`Updating Date-based dashboard for ride: ${hvfhs_license_num}, day: ${selectedDay}`);
    fetchDateKPIData();     // Fetch and update Key Performance Indicators
    fetchDailyRides();      // Fetch data for the daily ride volume chart
    fetchSharedRidesData(); // Fetch data for the shared rides distribution chart
}

// Function to trigger updates for the Bottom Section (Weather-based) dashboard
function updateWeatherBasedDashboard() {
    console.log(`Updating Weather-based dashboard for weather: ${selectedWeather}, ride: ${hvfhs_license_num}`); // Include ride for logging
    fetchWeatherKPIData();      // Fetch and update Key Performance Indicators for weather
    fetchRidesByWeather();      // Fetch data for the rides by weather line chart
    fetchWeatherSharedRidesData(); // Fetch data for the weather shared rides distribution chart
}

// Function to fetch KPI data for the Date-based section
function fetchDateKPIData() {
    const url = `/api/kpi?ride=${hvfhs_license_num}&day=${selectedDay}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} for ${url}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Date-based KPI Data received:', data);
            if (data.error) {
                console.error('Error from Date-based KPI API:', data.error);
                // Set all KPIs to 0 or default values on error
                document.getElementById('totalRides').textContent = '0';
                document.getElementById('driverPay').textContent = '$0.00';
                document.getElementById('totalMiles').textContent = '0.00';
                document.getElementById('totalTips').textContent = '$0.00'; 
                return;
            }
            // Update the KPI elements with fetched data, handling nulls or non-numeric values
            document.getElementById('totalRides').textContent = data.total_rides !== null ? data.total_rides : '0';
            document.getElementById('driverPay').textContent = data.driver_pay !== null && typeof data.driver_pay === 'number' ? `$${data.driver_pay.toFixed(2)}` : '$0.00';
            document.getElementById('totalMiles').textContent = data.total_miles !== null && typeof data.total_miles === 'number' ? `${data.total_miles.toFixed(2)}` : '0.00';
            document.getElementById('totalTips').textContent = data.total_tips !== null && typeof data.total_tips === 'number' ? `$${data.total_tips.toFixed(2)}` : '$0.00'; 
        })
        .catch(error => {
            console.error('Error fetching Date-based KPI data:', error);
            // Set all KPIs to 0 or default values on fetch error
            document.getElementById('totalRides').textContent = '0';
            document.getElementById('driverPay').textContent = '$0.00';
            document.getElementById('totalMiles').textContent = '0.00';
            document.getElementById('totalTips').textContent = '$0.00'; 
        });
}

// Function to fetch KPI data for the Weather-based section
function fetchWeatherKPIData() {
    // NEW: Include hvfhs_license_num in the URL for weather KPIs
    const url = `/api/kpi-weather?weather=${selectedWeather}&ride=${hvfhs_license_num}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} for ${url}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Weather-based KPI Data received:', data);
            if (data.error) {
                console.error('Error from Weather-based KPI API:', data.error);
                // Set all weather KPIs to 0 or default values on error
                document.getElementById('weatherTotalRides').textContent = '0';
                document.getElementById('weatherDriverPay').textContent = '$0.00';
                document.getElementById('weatherTotalMiles').textContent = '0.00';
                document.getElementById('weatherTotalTips').textContent = '$0.00'; 
                return;
            }
            // Update the weather KPI elements with fetched data, handling nulls or non-numeric values
            document.getElementById('weatherTotalRides').textContent = data.total_rides !== null ? data.total_rides : '0';
            document.getElementById('weatherDriverPay').textContent = data.driver_pay !== null && typeof data.driver_pay === 'number' ? `$${data.driver_pay.toFixed(2)}` : '$0.00';
            document.getElementById('weatherTotalMiles').textContent = data.total_miles !== null && typeof data.total_miles === 'number' ? `${data.total_miles.toFixed(2)}` : '0.00';
            document.getElementById('weatherTotalTips').textContent = data.total_tips !== null && typeof data.total_tips === 'number' ? `$${data.total_tips.toFixed(2)}` : '$0.00'; 
        })
        .catch(error => {
            console.error('Error fetching Weather-based KPI data:', error);
            // Set all weather KPIs to 0 or default values on fetch error
            document.getElementById('weatherTotalRides').textContent = '0';
            document.getElementById('weatherDriverPay').textContent = '$0.00';
            document.getElementById('weatherTotalMiles').textContent = '0.00';
            document.getElementById('weatherTotalTips').textContent = '$0.00'; 
        });
}

// Function: Populate the weather dropdown by fetching distinct weather conditions
function populateWeatherDropdown() {
    const weatherSelect = document.getElementById('weatherSelect');
    fetch('/api/weather-conditions')
        .then(response => {
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} for /api/weather-conditions`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Weather Conditions Data received:', data);
            weatherSelect.innerHTML = ''; // Clear existing options
            
            if (data.length === 0) {
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'No conditions available';
                weatherSelect.appendChild(defaultOption);
            } else {
                data.forEach(condition => {
                    const option = document.createElement('option');
                    option.value = condition.weather_condition;
                    option.textContent = condition.weather_condition;
                    weatherSelect.appendChild(option);
                });
            }
           
            // Set the selectedWeather to the first available option or a default, then update dashboard
            if (weatherSelect.options.length > 0) {
                selectedWeather = weatherSelect.value;
            } else {
                selectedWeather = 'FAIR'; // Fallback if no conditions are returned
            }
            updateWeatherBasedDashboard(); // Initial load for weather KPIs once dropdown is populated
        })
        .catch(error => {
            console.error('Error fetching weather conditions:', error);
            // Fallback option if fetching weather conditions fails
            weatherSelect.innerHTML = '';
            const option = document.createElement('option');
            option.value = 'FAIR';
            option.textContent = 'Failed to load weather';
            weatherSelect.appendChild(option);
            selectedWeather = 'FAIR'; // Ensure a default is set
            updateWeatherBasedDashboard(); // Try to update dashboard with fallback
        });
}

// Function to fetch daily rides data and generate the line chart (Date-based)
function fetchDailyRides() {
    const url = `/api/daily-rides?ride=${hvfhs_license_num}`; 
    fetch(url)
        .then(response => {
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} for ${url}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Daily Rides Data for chart received:', data);
            // Reformat data for generateLineChart (ensure 'label' and 'value' fields)
            const formattedData = data.map(item => ({ label: `Day ${item.date}`, value: item.count }));
            generateLineChart(formattedData, 'myChart', 'Day of Month (March 2025)');
        })
        .catch(error => {
            console.error('Error fetching daily rides for chart:', error);
            // Destroy chart and display error message on canvas
            if (lineChart) {
                lineChart.destroy();
            }
            const ctx = document.getElementById('myChart').getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#212121'; 
            ctx.textAlign = 'center';
            ctx.fillText('No Chart Data Available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        });
}

// Function to fetch Rides data by Weather condition and generate the line chart (Weather-based)
function fetchRidesByWeather() {
    // NEW: Include hvfhs_license_num in the URL for weather-based rides chart
    const url = `/api/rides-by-weather?ride=${hvfhs_license_num}`; 
    fetch(url)
        .then(response => {
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} for ${url}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Rides by Weather Data for chart received:', data);
            // Data is already formatted as { weather_condition: count }, convert to {label, value}
            const formattedData = data.map(item => ({ label: item.weather_condition, value: item.count }));
            generateLineChart(formattedData, 'weatherLineChart', 'Weather Condition');
        })
        .catch(error => {
            console.error('Error fetching rides by weather for chart:', error);
            // Destroy chart and display error message on canvas
            if (weatherLineChart) {
                weatherLineChart.destroy();
            }
            const ctx = document.getElementById('weatherLineChart').getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#212121'; 
            ctx.textAlign = 'center';
            ctx.fillText('No Chart Data Available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        });
}


// Function to generate a generic line chart
function generateLineChart(data, chartId, xAxisTitle) {
    const ctx = document.getElementById(chartId).getContext('2d');
    
    // Destroy existing chart instance if it exists to prevent rendering issues and memory leaks
    if (chartId === 'myChart' && lineChart) {
        lineChart.destroy();
    } else if (chartId === 'weatherLineChart' && weatherLineChart) {
        weatherLineChart.destroy();
    }

    if (!data || data.length === 0) {
        // If no data, clear canvas and display a message
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#212121'; 
        ctx.textAlign = 'center';
        ctx.fillText('No Chart Data Available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    // Sort data for consistent chart display (e.g., by day for daily rides, or alphabetically for weather)
    const sortedData = [...data].sort((a, b) => {
        // If x-axis is numeric (like day), sort numerically
        if (xAxisTitle.includes('Day')) {
            return parseInt(a.label.replace('Day ', '')) - parseInt(b.label.replace('Day ', ''));
        }
        // Otherwise, sort alphabetically by label
        return a.label.localeCompare(b.label);
    });

    const labels = sortedData.map(item => item.label);
    const counts = sortedData.map(item => item.value);

    // Create a new Chart.js instance
    const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Rides',
                borderColor: '#00bcd4', // Cyan Blue for line
                backgroundColor: 'rgba(0, 188, 212, 0.2)', // Transparent Cyan Blue for fill
                data: counts,
                borderWidth: 2,
                fill: true,
                tension: 0.3 // Smoothness of the line
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allows chart to fill its container
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#212121', 
                        font: { size: 10 } 
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Rides: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: xAxisTitle,
                        color: '#212121', 
                        font: { size: 10 } 
                    },
                    grid: { display: false }, // No grid lines on x-axis
                    ticks: {
                        color: '#212121', 
                        font: { size: 9 } 
                    }
                },
                y: {
                    beginAtZero: true, // Start y-axis from zero
                    title: {
                        display: true,
                        text: 'Number of Rides',
                        color: '#212121', 
                        font: { size: 10 } 
                    },
                    grid: { color: '#cfd8dc' }, // Light grid lines on y-axis
                    ticks: {
                        color: '#212121', 
                        precision: 0, // Ensure integer ticks for ride counts
                        font: { size: 9 } 
                    }
                    }
                }
            }
        });

    // Store the chart instance in the appropriate global variable
    if (chartId === 'myChart') {
        lineChart = newChart;
    } else if (chartId === 'weatherLineChart') {
        weatherLineChart = newChart;
    }
}

// Function to fetch Shared Rides data for the Date-based section (Pie Chart)
function fetchSharedRidesData() {
    const url = `/api/daily-shared-rides?ride=${hvfhs_license_num}&day=${selectedDay}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} for ${url}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Shared Rides Data received:', data);
            generateSharedRidesChart(data, 'sharedRidesChart');
        })
        .catch(error => {
            console.error('Error fetching shared rides data:', error);
            // Destroy chart and display error message on canvas
            if (sharedRidesChart) {
                sharedRidesChart.destroy();
            }
            const ctx = document.getElementById('sharedRidesChart').getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = '14px Arial';
            ctx.fillStyle = '#212121'; 
            ctx.textAlign = 'center';
            ctx.fillText('No Chart Data Available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        });
}

// Function to generate Shared Rides Chart (Pie Chart)
function generateSharedRidesChart(data, chartId) {
    const ctx = document.getElementById(chartId).getContext('2d');

    // Destroy existing chart instance
    if (chartId === 'sharedRidesChart' && sharedRidesChart) { sharedRidesChart.destroy(); }
    if (chartId === 'weatherSharedRidesChart' && weatherSharedRidesChart) { weatherSharedRidesChart.destroy(); }

    // Check for valid data for the pie chart
    if (!data || (data.shared_rides === 0 && data.non_shared_rides === 0)) {
        // If no data, clear canvas and display a message
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#212121'; 
        ctx.textAlign = 'center';
        ctx.fillText('No Chart Data Available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    const totalRides = data.shared_rides + data.non_shared_rides;
    // Calculate percentages, ensuring no division by zero
    const sharedPercentage = totalRides > 0 ? (data.shared_rides / totalRides * 100).toFixed(1) : 0;
    const nonSharedPercentage = totalRides > 0 ? (data.non_shared_rides / totalRides * 100).toFixed(1) : 0; // Corrected from non_rides

    const labels = [`Shared (${sharedPercentage}%)`, `Non-Shared (${nonSharedPercentage}%)`];
    const counts = [data.shared_rides, data.non_shared_rides];

    // Create a new Chart.js Pie chart instance
    const newChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: [
                    '#009688', // Teal Green for Shared
                    '#80cbc4'  // Light Teal Green for Non-Shared
                ],
                borderColor: [
                    '#e0f2f1', // Very Light Teal/Green border for contrast
                    '#e0f2f1'  // Very Light Teal/Green border for contrast
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Essential for controlling size by container
            plugins: {
                legend: {
                    position: 'right', // Place legend on the right
                    labels: {
                        color: '#212121', 
                        font: { size: 10 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const percentage = (value / totalRides * 100).toFixed(1);
                            return `${label}: ${value} rides (${percentage}%)`;
                        }
                    }
                }
            },
            layout: {
                padding: 10 // Add a small padding inside the chart canvas to prevent cutoff
            },
            elements: {
                arc: {
                    borderWidth: 1, 
                    spacing: 0 
                }
            }
        }
    });

    // Store the chart instance in the appropriate global variable
    if (chartId === 'sharedRidesChart') {
        sharedRidesChart = newChart;
    } else if (chartId === 'weatherSharedRidesChart') {
        weatherSharedRidesChart = newChart;
    }
}

// Function to fetch Shared Rides data for the Weather-based section (Pie Chart)
function fetchWeatherSharedRidesData() {
    // NEW: Include hvfhs_license_num in the URL for weather-based shared rides chart
    const url = `/api/weather-shared-rides?weather=${selectedWeather}&ride=${hvfhs_license_num}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} for ${url}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Weather Shared Rides Data received:', data);
            generateSharedRidesChart(data, 'weatherSharedRidesChart');
        })
        .catch(error => {
            console.error('Error fetching weather shared rides data:', error);
            // Destroy chart and display error message on canvas
            if (weatherSharedRidesChart) {
                weatherSharedRidesChart.destroy();
            }
            const ctx = document.getElementById('weatherSharedRidesChart').getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = '14px Arial';
            ctx.fillStyle = '#212121'; 
            ctx.textAlign = 'center';
            ctx.fillText('No Chart Data Available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        });
}
