let hvfhs_license_num = 'HV0003';  // Default to Uber
let selectedDay = 1; // Default to the first day of the month
//let fixedDay = 1; // Define fixedDay with a specific day
let lineChart;
let data;

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard JS is now running!");

    populateCalendar(); // Call the function to populate the calendar
    updateDashboard(); // Load initial dashboard data

    // Run the function when the DOM is fully loaded
    // document.addEventListener('DOMContentLoaded', populateDays);

    // Add an event listener to the dropdown
    document.getElementById('rideSelect').addEventListener('change', function() {
        hvfhs_license_num = this.value; // Get the selected value
        console.log('Selected ride license number:', hvfhs_license_num);
        updateDashboard(); // Update the dashboard based on the selection
    });

});

// Function to populate the calendar for March 2025
function populateCalendar() {
    const calendar = document.getElementById('calendar');
    const totalDays = 31; // Total days in March
    
    // Clear any existing content
    calendar.innerHTML = '';

    // Create a header for the days of the week
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const headerRow = document.createElement('div');
    headerRow.className = 'header-row';
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.textContent = day;
        headerRow.appendChild(dayHeader);
    });
    calendar.appendChild(headerRow);

    // Calculate the first day of March 2025
    const firstDay = new Date(2025, 2, 1).getDay(); // March is month 2 (0-indexed)

    // Create empty cells for days before the first day of March
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-cell empty';
        calendar.appendChild(emptyCell);
    }

    // Create cells for each day of March
    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        dayCell.textContent = day;
        dayCell.className = 'calendar-cell';
        dayCell.addEventListener('click', () => handleDayClick(day));

        // Highlight the fixed day
        if (day === selectedDay) {
            dayCell.classList.add('selected'); // Add a class to highlight the fixed day
        }

        calendar.appendChild(dayCell);
    }
}

// Function to handle day click
function handleDayClick(day) {
    selectedDay = day; // Update the selected day
    updateDashboard(); // Update the dashboard based on the selected day
}

function handleRideSelection(licenseNum) {
    const rideInfoDiv = document.getElementById('rideInfo');
    // Clear previous information
    rideInfoDiv.innerHTML = '';

    // Display information based on the selected license number
    if (licenseNum === 'HV0003') {
        rideInfoDiv.innerHTML = '<h2>Uber Selected</h2><p>Details about Uber ride...</p>';
    } else if (licenseNum === 'HV0005') {
        rideInfoDiv.innerHTML = '<h2>Lyft Selected</h2><p>Details about Lyft ride...</p>';
    }
}

function fetchDailyRides() {
    const url = `/api/daily-rides?ride=${hvfhs_license_num}&day=${selectedDay}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            generateLineChart(data);
        })
        .catch(error => {
            console.error('Error fetching daily rides:', error);
        });
}


function populateRideDropdown() {
    rides.forEach(ride => {
        // Access the ride name using ride.rides
        console.log(ride.rides);
        // Add logic to populate the dropdown
    });
}

// Function to update the dashboard
function updateDashboard() {
    fetchKPIData();
    fetchDailyRides();
}

// Function to fetch KPI data
function fetchKPIData() {
    const url = `/api/kpi?ride=${hvfhs_license_num}&day=${selectedDay}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById('salesAmount').textContent = `${data.totalFare.toFixed(2)}`;
            document.getElementById('numberSales').textContent = data.numberOfServices;
            document.getElementById('averageSales').textContent = `${data.averageSaleValue.toFixed(2)}`;
        });
}

// Function to fetch daily rides data and generate the line chart
function fetchKPIData() {
    const url = `/api/kpi?ride=${hvfhs_license_num}&day=${selectedDay}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error(data.error);
                return; // Exit if there's an error
            }
            document.getElementById('salesAmount').textContent = data.totalFare ? `${data.totalFare.toFixed(2)}` : '$0.00';
            document.getElementById('numberSales').textContent = data.numberOfServices || 0;
            document.getElementById('averageSales').textContent = data.averageSaleValue ? `${data.averageSaleValue.toFixed(2)}` : '$0.00';
        })
        .catch(error => {
            console.error('Error fetching KPI data:', error);
        });
}


// Function to generate the line chart
function generateLineChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const labels = data.map(item => item.date);
    const rides = data.map(item => item.count);

    // Check if a chart already exists and destroy it
    if (lineChart) {
        lineChart.destroy(); // Destroy the existing chart
    }

    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Rides',
                data: rides,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
