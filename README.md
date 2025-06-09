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

4. Technologies Used
             
- Backend: Flask (Python web framework), SQLite, Python.
- Frontend: HTML5, CSS3, JavaScript, Chart.js.
- Machine Learning: TensorFlow, Keras-tuner, scikit-learn.
- Data Processing: Pandas, Meteostat, SQLAlchemy, Matplotlib.
            
5. Setup and Installation
         
- Prerequisites: Python 3.x (3.8+ recommended), pip, Git.
- Clone Repository: git clone https://github.com/tiyafrancy/ride-sharing-analytics.git 
- Install Dependencies: pip install -r requirements.txt
- Running the Flask Application:
* Navigate to src/ride_share_dashboard.
* Run python app.py.
* Access the dashboard at http://127.0.0.1:5000/.
- Running the Deep Learning Notebook:
  * Local Environment: Start Jupyter Notebook (jupyter notebook), then open deep_learning_implementation.ipynb and run the cells.
  * Google Colab Cloud Environment. Open deep_learning_implementation.ipynb in Google Colab. Upload the main database file to Colab's temporary session storage to get the initial data.
       
6. Data Handling
         
Raw data is in Parquet format (fhvhv_tripdata_2025-03.parquet).
Processed data is stored in ride_share.db.
Data includes ride information and integrated weather data.
     
7. Key Observations and Strategic Implications for Drivers
         
Weather-Dependent Earnings: Lyft tends to offer higher pay in adverse weather.
Weekday Patterns: Wednesday and Thursday show peak earnings for both platforms.
Tuesday Anomaly: High tips for both Uber and Lyft on Tuesdays.
Platform Choice: A dynamic approach, considering real-time conditions, can enhance earnings.
     
8. Limitations and Future Development
     
> Current Limitations
* Data Scope: The current analysis is limited to sample data for March 2025 and specifically focuses on Uber (HV0003) and Lyft (HV0005) in New York City. This limits the generalizability of findings to other periods, cities, or ride-sharing services.
* Weather Data Granularity: While weather data is integrated, its impact is aggregated. More granular weather effects (e.g., specific wind speeds, microclimates within NYC) or combining multiple weather factors could offer deeper insights.
* Feature Engineering: The existing features primarily revolve around basic trip metrics and weather. Driver-specific factors (e.g., driver ratings, vehicle type, driving hours), real-time traffic conditions, or event-based demand surges are not yet fully incorporated.
* UI/UX Sophistication: While functional, the dashboard's user interface and experience could be enhanced with more interactive visualizations, custom map integrations, and a more polished design.
* Business Context & External Factors: The analysis doesn't currently account for external factors like major city events (concerts, parades), public transport disruptions, or competitor pricing strategies, all of which influence ride-share demand and pricing.
      
> Future Development
Based on these limitations, here are several avenues for future development:

* Expand Data Coverage: Integrate larger datasets spanning multiple years and diverse geographic locations to make the insights more broadly applicable. Also, consider incorporating data from public transport for a holistic urban mobility view.
* Advanced Feature Integration: Incorporate real-time traffic information, major event data (concerts, sports), and detailed geospatial features (e.g., proximity to landmarks, neighborhood characteristics) to create richer datasets for analysis and prediction.
* Enhanced Deep Learning Models: Explore more complex neural network architectures and advanced hyperparameter tuning techniques to improve the accuracy and robustness of driver pay predictions.
* Real-time Dashboard & Alerts: Develop a live dashboard that streams real-time data, displays predictive heatmaps of high-demand areas, and potentially offers alert systems for drivers based on current lucrative conditions.
* Interactive Geospatial Analysis: Implement interactive maps directly within the dashboard to visualize ride patterns, earnings hotspots, and weather impacts across different city zones.
* Scalability & Deployment: For production environments, consider migrating from SQLite to a more robust database like PostgreSQL and explore cloud deployment solutions (e.g., AWS, GCP) to ensure the application can handle larger loads and operate reliably.

## References

This project leverages publicly available data and open-source libraries. Key references include:
- For-Hire Vehicle High-Volume (FHVHV) Trip Record Data: The primary dataset used for ride-sharing analysis, https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page 
- Meteostat Library: Used for fetching historical weather data. https://dev.meteostat.net/python/
- Chart.js: JavaScript charting library used for data visualization in the dashboard. https://cdnjs.com/libraries/Chart.js
- TensorFlow & Keras: Open-source machine learning frameworks used for developing the deep learning model. https://www.tensorflow.org/   https://keras.io/
- scikit-learn: Python library for machine learning, used for preprocessing and model evaluation. https://scikit-learn.org/stable/
- AI Language Models: Google Gemini and ChatGPT were utilized for assistance in coding, drafting documentation, refining explanations, and brainstorming ideas for the project's README.

