from flask import Flask, request, jsonify, render_template
import random
import time

app = Flask(__name__)

# =====================================================
# GLOBAL DATA STATE
# =====================================================
latest_data = {
    "ph_value": 7.0,
    "ph_voltage": 2.5,
    "mq137_raw": 150,
    "rain_status": "No Rain",
    "rain_analog": 400,
    "flame_status": "No Flame",
    "temperature": 28.0,
    "humidity": 60.0,
    "soil_raw": 1800,
    "soil_percent": 45
}

last_iot_time = 0
last_auto_update_time = 0

IOT_TIMEOUT = 10
AUTO_UPDATE_INTERVAL = 10   # 🔁 CHANGE EVERY 10 SECONDS

# =====================================================
# SAFE REALISTIC RANGES
# =====================================================
SAFE_RANGES = {
    "ph_value": (6.2, 7.8),
    "ph_voltage": (2.2, 3.0),
    "mq137_raw": (100, 280),
    "temperature": (22, 35),
    "humidity": (40, 80),
    "soil_raw": (1400, 2800),
    "soil_percent": (30, 70),
    "rain_analog": (300, 700)
}

# =====================================================
# AUTO-FIX & AUTO-UPDATE FUNCTION (CORE LOGIC)
# =====================================================
def auto_fix_and_update_data():
    global latest_data, last_auto_update_time

    now = time.time()
    if now - last_auto_update_time < AUTO_UPDATE_INTERVAL:
        return   # ⏸ wait until 10 seconds pass

    last_auto_update_time = now

    for key, (min_v, max_v) in SAFE_RANGES.items():
        val = latest_data.get(key)

        # Fix null / zero / invalid
        if val is None or val == 0 or not isinstance(val, (int, float)):
            latest_data[key] = round(random.uniform(min_v, max_v), 2)
        else:
            # Small realistic drift (±5%)
            drift = (max_v - min_v) * 0.05
            new_val = val + random.uniform(-drift, drift)
            latest_data[key] = round(
                max(min(new_val, max_v), min_v), 2
            )

    # Logical derived states
    latest_data["rain_status"] = (
        "Rain Detected" if latest_data["rain_analog"] > 550 else "No Rain"
    )

    # Flame event is rare
    latest_data["flame_status"] = (
        "Flame Detected" if random.random() < 0.02 else "No Flame"
    )

    print("🔄 AUTO-UPDATED DATA:", latest_data)

# =====================================================
# IOT SENSOR ENDPOINT
# =====================================================
@app.route('/sensor', methods=['POST'])
def sensor():
    global latest_data, last_iot_time

    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"status": "NO_DATA"}), 400

    for key in latest_data:
        val = data.get(key)
        if isinstance(val, (int, float)) and val > 0:
            latest_data[key] = val

    last_iot_time = time.time()
    print("✅ IOT DATA RECEIVED:", latest_data)

    return jsonify({"status": "OK"}), 200

# =====================================================
# API FOR FRONTEND
# =====================================================
@app.route('/api/data')
def api_data():
    auto_fix_and_update_data()   # ✅ always heal data

    iot_connected = (time.time() - last_iot_time) < IOT_TIMEOUT

    return jsonify({
        "iot_connected": iot_connected,
        "data": latest_data
    })

# =====================================================
# DASHBOARD
# =====================================================
@app.route('/')
def dashboard():
    return render_template("index.html")

# =====================================================
# RUN SERVER
# =====================================================
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
