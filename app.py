from flask import Flask, render_template, jsonify, request
import sqlite3
import os

app = Flask(__name__)

def get_db_connection():
    """Create a database connection and return the connection object"""
    conn = sqlite3.connect("ride_share.db")
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    return conn

def query_db(query, args=(), one=False):
    """Query the database and return results as dictionaries"""
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(query, args)
        rv = [dict(row) for row in cur.fetchall()]
        conn.commit() # Commit changes for operations like INSERT/UPDATE/DELETE, though not strictly needed for SELECTs
        return (rv[0] if rv else None) if one else rv
    except sqlite3.Error as e:
        print(f"Database error in query_db: {e}")
        raise # Re-raise the exception to be caught by the route handler
    finally:
        conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/daily-rides')
def get_daily_rides():
    ride = request.args.get('ride')
    
    if not ride:
        print("API: /api/daily-rides - Missing ride parameter")
        return jsonify({"error": "Missing ride parameter"}), 400

    query = """
        SELECT 
            strftime('%d', pickup_datetime) AS date, 
            COUNT(*) AS count
        FROM ride_share_table
        WHERE hvfhs_license_num = ? 
          AND strftime('%Y-%m', pickup_datetime) = '2025-03'
        GROUP BY date
        ORDER BY date ASC;
    """
    args = (ride,)

    try:
        daily_rides_data = query_db(query, args)
        print(f"API: /api/daily-rides - Data for ride '{ride}': {daily_rides_data}")
        return jsonify(daily_rides_data)
    except Exception as e:
        print(f"API: /api/daily-rides - Error fetching daily rides: {e}")
        return jsonify({"error": "Failed to fetch daily rides data"}), 500

@app.route('/api/kpi')
def get_kpi_data():
    ride = request.args.get('ride')
    day = request.args.get('day')

    if not ride or not day:
        print("API: /api/kpi - Missing ride or day parameter")
        return jsonify({"error": "Missing ride or day parameter"}), 400

    formatted_day = f'{int(day):02d}'
    print(f"API: /api/kpi - Requesting KPI for ride: {ride}, day: {formatted_day}")

    query = """
        SELECT 
            COUNT(*) AS total_rides,
            SUM(driver_pay) AS driver_pay,
            SUM(trip_miles) AS total_miles,
            SUM(tips) AS total_tips
        FROM ride_share_table
        WHERE hvfhs_license_num = ? 
          AND strftime('%d', pickup_datetime) = ?
          AND strftime('%Y-%m', pickup_datetime) = '2025-03';
    """
    args = (ride, formatted_day)

    try:
        kpi_data = query_db(query, args, one=True)
        print(f"API: /api/kpi - Raw DB result: {kpi_data}")

        if kpi_data is None:
            kpi_data = {
                "total_rides": 0,
                "driver_pay": 0.0,
                "total_miles": 0.0,
                "total_tips": 0.0
            }
            print("API: /api/kpi - No data found, returning default KPIs.")
        else:
            # Explicitly ensure numeric types and handle None
            kpi_data["total_rides"] = int(kpi_data["total_rides"]) if kpi_data["total_rides"] is not None else 0
            kpi_data["driver_pay"] = float(kpi_data["driver_pay"]) if kpi_data["driver_pay"] is not None else 0.0
            kpi_data["total_miles"] = float(kpi_data["total_miles"]) if kpi_data["total_miles"] is not None else 0.0
            kpi_data["total_tips"] = float(kpi_data["total_tips"]) if kpi_data["total_tips"] is not None else 0.0
            print(f"API: /api/kpi - Processed KPI data: {kpi_data}")
        
        return jsonify(kpi_data)
    except Exception as e:
        print(f"API: /api/kpi - Error fetching KPI data: {e}")
        return jsonify({"error": "Failed to fetch KPI data"}), 500


@app.route('/api/weather-conditions')
def get_weather_conditions():
    query = "SELECT DISTINCT weather_condition FROM ride_share_table WHERE weather_condition IS NOT NULL AND weather_condition != '' ORDER BY weather_condition;"
    try:
        conditions = query_db(query)
        print(f"API: /api/weather-conditions - Data: {conditions}")
        return jsonify(conditions)
    except Exception as e:
        print(f"API: /api/weather-conditions - Error fetching weather conditions: {e}")
        return jsonify({"error": "Failed to fetch weather conditions"}), 500


@app.route('/api/kpi-weather')
def get_kpi_weather_data():
    weather = request.args.get('weather')
    ride = request.args.get('ride') # NEW: Get ride parameter

    if not weather:
        print("API: /api/kpi-weather - Missing weather parameter")
        return jsonify({"error": "Missing weather parameter"}), 400

    print(f"API: /api/kpi-weather - Requesting KPI for weather: {weather}, ride: {ride}")

    base_query = """
        SELECT 
            COUNT(*) AS total_rides,
            SUM(driver_pay) AS driver_pay,
            SUM(trip_miles) AS total_miles,
            SUM(tips) AS total_tips
        FROM ride_share_table
        WHERE weather_condition = ?
    """
    args = [weather]

    if ride: # NEW: Conditionally add ride filter
        base_query += " AND hvfhs_license_num = ?"
        args.append(ride)

    try:
        kpi_weather_data = query_db(base_query, args, one=True)
        print(f"API: /api/kpi-weather - Raw DB result: {kpi_weather_data}")

        if kpi_weather_data is None:
            kpi_weather_data = {
                "total_rides": 0,
                "driver_pay": 0.0,
                "total_miles": 0.0,
                "total_tips": 0.0
            }
            print("API: /api/kpi-weather - No data found, returning default KPIs.")
        else:
            # Explicitly ensure numeric types and handle None
            kpi_weather_data["total_rides"] = int(kpi_weather_data["total_rides"]) if kpi_weather_data["total_rides"] is not None else 0
            kpi_weather_data["driver_pay"] = float(kpi_weather_data["driver_pay"]) if kpi_weather_data["driver_pay"] is not None else 0.0
            kpi_weather_data["total_miles"] = float(kpi_weather_data["total_miles"]) if kpi_weather_data["total_miles"] is not None else 0.0
            kpi_weather_data["total_tips"] = float(kpi_weather_data["total_tips"]) if kpi_weather_data["total_tips"] is not None else 0.0
            print(f"API: /api/kpi-weather - Processed KPI data: {kpi_weather_data}")
        
        return jsonify(kpi_weather_data)
    except Exception as e:
        print(f"API: /api/kpi-weather - Error fetching weather KPI data: {e}")
        return jsonify({"error": "Failed to fetch weather KPI data"}), 500


@app.route('/api/daily-shared-rides')
def get_daily_shared_rides():
    ride = request.args.get('ride')
    day = request.args.get('day')

    if not ride or not day:
        print("API: /api/daily-shared-rides - Missing ride or day parameter")
        return jsonify({"error": "Missing ride or day parameter"}), 400

    formatted_day = f'{int(day):02d}'

    query = """
        SELECT 
            SUM(CASE WHEN shared_match_flag = 'Y' THEN 1 ELSE 0 END) AS shared_rides,
            SUM(CASE WHEN shared_match_flag = 'N' THEN 1 ELSE 0 END) AS non_shared_rides
        FROM ride_share_table
        WHERE hvfhs_license_num = ? 
          AND strftime('%d', pickup_datetime) = ?
          AND strftime('%Y-%m', pickup_datetime) = '2025-03';
    """
    args = (ride, formatted_day)

    try:
        shared_rides_data = query_db(query, args, one=True)
        if shared_rides_data is None:
            shared_rides_data = {"shared_rides": 0, "non_shared_rides": 0}
            print("API: /api/daily-shared-rides - No data found, returning default shared rides.")
        else:
            shared_rides_data["shared_rides"] = shared_rides_data["shared_rides"] if shared_rides_data["shared_rides"] is not None else 0
            shared_rides_data["non_shared_rides"] = shared_rides_data["non_shared_rides"] if shared_rides_data["non_shared_rides"] is not None else 0
            print(f"API: /api/daily-shared-rides - Data: {shared_rides_data}")

        return jsonify(shared_rides_data)
    except Exception as e:
        print(f"API: /api/daily-shared-rides - Error fetching daily shared rides data: {e}")
        return jsonify({"error": "Failed to fetch daily shared rides data"}), 500


@app.route('/api/weather-shared-rides')
def get_weather_shared_rides():
    weather = request.args.get('weather')
    ride = request.args.get('ride') # NEW: Get ride parameter

    if not weather:
        print("API: /api/weather-shared-rides - Missing weather parameter")
        return jsonify({"error": "Missing weather parameter"}), 400

    base_query = """
        SELECT 
            SUM(CASE WHEN shared_match_flag = 'Y' THEN 1 ELSE 0 END) AS shared_rides,
            SUM(CASE WHEN shared_match_flag = 'N' THEN 1 ELSE 0 END) AS non_shared_rides
        FROM ride_share_table
        WHERE weather_condition = ?
    """
    args = [weather]

    if ride: # NEW: Conditionally add ride filter
        base_query += " AND hvfhs_license_num = ?"
        args.append(ride)

    try:
        shared_rides_data = query_db(base_query, args, one=True)
        if shared_rides_data is None:
            shared_rides_data = {"shared_rides": 0, "non_shared_rides": 0}
            print("API: /api/weather-shared-rides - No data found, returning default shared rides.")
        else:
            shared_rides_data["shared_rides"] = shared_rides_data["shared_rides"] if shared_rides_data["shared_rides"] is not None else 0
            shared_rides_data["non_shared_rides"] = shared_rides_data["non_shared_rides"] if shared_rides_data["non_shared_rides"] is not None else 0
            print(f"API: /api/weather-shared-rides - Data: {shared_rides_data}")

        return jsonify(shared_rides_data)
    except Exception as e:
        print(f"API: /api/weather-shared-rides - Error fetching weather shared rides data: {e}")
        return jsonify({"error": "Failed to fetch weather shared rides data"}), 500

@app.route('/api/rides-by-weather')
def get_rides_by_weather():
    ride = request.args.get('ride') # NEW: Get ride parameter

    base_query = """
        SELECT 
            weather_condition, 
            COUNT(*) AS count
        FROM ride_share_table
        WHERE weather_condition IS NOT NULL AND weather_condition != ''
    """
    args = []

    if ride: # NEW: Conditionally add ride filter
        base_query += " AND hvfhs_license_num = ?"
        args.append(ride)
    
    base_query += " GROUP BY weather_condition ORDER BY weather_condition ASC;"

    try:
        rides_by_weather_data = query_db(base_query, args)
        print(f"API: /api/rides-by-weather - Data: {rides_by_weather_data}")
        return jsonify(rides_by_weather_data)
    except Exception as e:
        print(f"API: /api/rides-by-weather - Error fetching rides by weather data: {e}")
        return jsonify({"error": "Failed to fetch rides by weather data"}), 500

if __name__ == '__main__':
    app.run(debug=True)
