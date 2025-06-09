# Ride-Sharing Data Analysis Project
This project is a comprehensive analysis of ride-sharing data, focusing on driver earnings, the impact of weather conditions, and overall ride analytics. It includes a web dashboard for data visualization and a deep learning model for driver pay prediction. The data primarily focuses on Uber (HV0003) and Lyft (HV0005) rides in New York City, particularly for March 2025.
     
1. Project Overviews
* Ride Share Database Creation: Focuses on integrating weather data with ride data for more in-depth analysis.
* Ride Share Dashboard: Provides an interactive dashboard for analyzing daily ride performance and the impact of weather.
* Deep Learning: Extends the analysis with a deep learning model to predict driver pay and includes a more detailed project structure.
* Data Analysis of Ride-Share Driver Earnings: Consolidates findings on driver pay and tips, considering weather and weekday trends, to provide strategic insights for drivers.
      
2. Key Features and Functionality
* Daily Ride Analytics: KPIs such as total rides, miles, driver pay, and tips for selected days.
* Weather Impact Analytics: KPIs aggregated by weather conditions.
* Interactive Filters: Calendar, ride service (Uber/Lyft), and weather condition filters.
* Data Visualization: Line and pie charts for ride volume and shared ride distribution.
* Driver Pay Prediction: Deep learning model to forecast driver earnings.
* Database Integration: SQLite database (ride_share.db) for efficient data storage and querying.
* Weather Data Integration: Combines ride data with weather information from Meteostat.
      
3. Project Structure
```text
ride-sharing-analytics/
├── ride_share.ipynb
├── deep_learning_implementation.ipynb
├── data_analysis.ipynb
├── .gitignore
├── README.md
└── requirements.txt
│
├── images/
│   ├── dashboard/
│       ├── daily_ride_analytics.png
│       ├── side_panel.png
│       └── weather_impact_analytics.png
│   ├── daily_avg_driver_pay.png
│   ├── daily_avg_driver_tips.png
│   ├── avg_driver_pay_weather.png
│   └── avg_driver_tips_weather.png
│
├── main_database/
│   └── fhvhv_tripdata_2025-03.parquet
│
├── ML_artifacts/
│   ├── ride_share_model.h5
│   └── model_optimization_results.csv
│
├── results/
│       ├── ride_data.csv
│       ├── ride_data_with_weather_condition.csv
│       └── ride_share.db       
│   
├── ride_share_dashboard/
│       ├── app.py
│       ├── ride_share.db
│       ├── templates/
│       │   └── index.html
│       └── static/
│           ├── css/
│               └── style.css
│           └── js/
│               └── script.js
```

5. Technologies Used
Backend: Flask (Python web framework), SQLite, Python.
Frontend: HTML5, CSS3, JavaScript, Chart.js.
Machine Learning: TensorFlow, Keras-tuner.
Data Processing: Pandas, Meteostat.
6. Setup and Installation
Prerequisites: Python 3.x (3.8+ recommended), pip, Git.
Clone Repository: git clone <your-repo-url>
Virtual Environment (Recommended):
python3 -m venv .venv
source .venv/bin/activate (macOS/Linux) or .venv\Scripts\activate (Windows)
Install Dependencies: pip install -r requirements.txt
Database Setup: Run create_db.py to create and populate ride_share.db. Ensure the correct project structure is followed.
Running the Flask Application:
Navigate to src/ride_share_dashboard.
Run python app.py. Access the dashboard at http://127.0.0.1:5000/.
Running the Deep Learning Notebook: Use Jupyter Notebook to open and run deep_learning_implementation.ipynb.
7. Data Handling
Raw data is in Parquet format (fhvhv_tripdata_2025-03.parquet).
Processed data is stored in ride_share.db.
Data includes ride information and integrated weather data.
8. Key Observations and Strategic Implications for Drivers
Weather-Dependent Earnings: Lyft tends to offer higher pay in adverse weather.
Weekday Patterns: Wednesday and Thursday show peak earnings for both platforms.
Tuesday Anomaly: High tips for both Uber and Lyft on Tuesdays.
Platform Choice: A dynamic approach, considering real-time conditions, can enhance earnings.
9. Further Analysis
The SQLite database allows for detailed analysis using SQL queries, such as investigating the impact of weather on fares, comparing Uber and Lyft patterns, and analyzing driver pay.


