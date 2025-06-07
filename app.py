from flask import Flask, render_template, jsonify, request
import sqlite3

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
        conn.commit()
        return (rv[0] if rv else None) if one else rv
    finally:
        conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/daily-rides')
def get_ride_names():
    query = "SELECT DISTINCT hvfhs_license_num as rides FROM ride_share_table;"
    ride_name = query_db(query)
    return jsonify(ride_name)

@app.route('/api/trip-durations')
def get_trip_durations():
    year = request.args.get('year', default='2025')  # Default to 2025
    month = request.args.get('month', default='03')  # Default to March

    query = """
        SELECT trip_time
        FROM ride_share_table
        WHERE (strftime('%Y', pickup_datetime) = ? OR ? IS NULL)
          AND (strftime('%m', pickup_datetime) = ? OR ? IS NULL)
    """
    args = (year, year, month, month)
    trip_durations = query_db(query, args)

    durations = [duration['trip_time'] for duration in trip_durations] if trip_durations else []
    return jsonify(durations)

@app.route('/api/kpi')
def get_kpi_data():
    ride = request.args.get('ride')
    day = request.args.get('day')

    # Check if ride and day parameters are provided
    if not ride or not day:
        return jsonify({"error": "Missing ride or day parameter"}), 400

    query = """
        SELECT 
            SUM(base_passenger_fare) AS total_fare,
            COUNT(*) AS number_of_services,
            AVG(base_passenger_fare) AS average_sale_value
        FROM ride_share_table
        WHERE hvfhs_license_num = ? AND strftime('%d', pickup_datetime) = ?
    """
    args = (ride, day)

    try:
        kpi_data = query_db(query, args, one=True)  # Fetch a single result
        if kpi_data is None:
            return jsonify({"error": "No data found for the given parameters"}), 404
        
        return jsonify(kpi_data)  # Return the KPI data as JSON
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Return error as JSON


if __name__ == '__main__':
    app.run(debug=True)

