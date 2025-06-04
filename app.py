from flask import Flask, render_template, request
import pandas as pd

app = Flask(__name__)

# Load data
uber_data = pd.read_csv('uber_data_march_2025.csv')
lyft_data = pd.read_csv('lyft_data_march_2025.csv')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    # Example: Calculate total rides and average fare
    total_uber_rides = len(uber_data)
    total_lyft_rides = len(lyft_data)
    avg_uber_fare = uber_data['base_passenger_fare'].mean()
    avg_lyft_fare = lyft_data['base_passenger_fare'].mean()

    return render_template('dashboard.html', 
                           total_uber_rides=total_uber_rides,
                           total_lyft_rides=total_lyft_rides,
                           avg_uber_fare=avg_uber_fare,
                           avg_lyft_fare=avg_lyft_fare)

if __name__ == '__main__':
    app.run(debug=True)
