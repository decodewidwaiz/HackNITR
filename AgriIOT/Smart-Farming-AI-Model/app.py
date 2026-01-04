from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
import json
import numpy as np
from datetime import datetime, timedelta
import asyncio
import aiohttp
from typing import Dict, Any, Optional
import pandas as pd
import os

from models.predict import FarmPredictor
from utils.data_processor import DataProcessor

# Initialize FastAPI app
app = FastAPI(title="Smart Farming AI Analytics", version="1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize components
predictor = FarmPredictor()
data_processor = DataProcessor()

# IoT Server Configuration
IOT_SERVER_URL = "http://10.161.12.188:5000"

# Pydantic models
class SensorData(BaseModel):
    ph_value: Optional[float] = None
    ph_voltage: Optional[float] = None
    mq137_raw: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    soil_raw: Optional[float] = None
    soil_percent: Optional[float] = None
    rain_status: Optional[str] = None
    flame_status: Optional[str] = None
    rain_analog: Optional[float] = None
    timestamp: Optional[str] = None

# In-memory storage for real-time data
current_sensor_data = {
    "ph_value": 6.8,
    "temperature": 25.5,
    "humidity": 65.0,
    "soil_percent": 55.0,
    "mq137_raw": 350.0,
    "rain_status": "No Rain",
    "flame_status": "No Flame"
}
historical_predictions = []

# IoT Data Fetcher
class IoTDataFetcher:
    def __init__(self, iot_url=IOT_SERVER_URL):
        self.iot_url = iot_url
        self.session = None
        self.last_fetch_time = None
    
    async def create_session(self):
        """Create aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5))
    
    async def fetch_sensor_data(self):
        """Fetch real-time data from IoT server"""
        try:
            await self.create_session()
            self.last_fetch_time = datetime.now()
            
            async with self.session.get(f"{self.iot_url}/api/data") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"Fetched sensor data from IoT server: {data}")
                    
                    # Check if data is in the expected format
                    if isinstance(data, dict) and 'data' in data:
                        return data['data']  # Extract the nested sensor data
                    else:
                        return data  # Return as-is if format is different
                else:
                    print(f"Failed to fetch data: HTTP {response.status}")
                    return None
                    
        except Exception as e:
            print(f"Error fetching sensor data: {e}")
            return None
    
    async def check_connection(self):
        """Check if IoT server is accessible"""
        try:
            await self.create_session()
            async with self.session.get(f"{self.iot_url}/api/health") as response:
                if response.status == 200:
                    return {"status": "connected", "message": "IoT server is accessible"}
                else:
                    return {"status": "disconnected", "message": f"HTTP {response.status}"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def close(self):
        """Close the session"""
        if self.session and not self.session.closed:
            await self.session.close()

# Initialize IoT fetcher
iot_fetcher = IoTDataFetcher()

async def fetch_and_process_iot_data():
    """Fetch data from IoT server and process it"""
    try:
        # Fetch from IoT server
        sensor_data = await iot_fetcher.fetch_sensor_data()
        
        if sensor_data:
            print(f"Processing sensor data: {sensor_data}")
            
            # Clean the data - remove placeholder values and handle string conversions
            cleaned_data = {}
            for key, value in sensor_data.items():
                if value != "---" and value is not None:
                    # Try to convert to appropriate type
                    try:
                        if isinstance(value, str):
                            # Remove any non-numeric characters except decimal point and minus sign
                            if key in ['ph_value', 'temperature', 'humidity', 'soil_percent', 
                                      'mq137_raw', 'ph_voltage', 'soil_raw', 'rain_analog']:
                                # Try to convert numeric strings
                                try:
                                    cleaned_data[key] = float(value)
                                except ValueError:
                                    # If conversion fails, try to extract numbers from string
                                    import re
                                    numbers = re.findall(r"[-+]?\d*\.\d+|\d+", value)
                                    if numbers:
                                        cleaned_data[key] = float(numbers[0])
                                    else:
                                        cleaned_data[key] = value
                            else:
                                # Keep non-numeric fields as strings
                                cleaned_data[key] = value
                        else:
                            # Already numeric or other type
                            cleaned_data[key] = value
                    except Exception as conv_error:
                        print(f"Error converting {key}={value}: {conv_error}")
                        cleaned_data[key] = value
            
            print(f"Cleaned data: {cleaned_data}")
            
            # Only process if we have real data
            if cleaned_data:
                # Create SensorData object
                try:
                    sensor_obj = SensorData(**cleaned_data)
                    
                    # Update through our API
                    result = await update_sensor_data_internal(sensor_obj)
                    return True
                except Exception as model_error:
                    print(f"Error creating SensorData object: {model_error}")
                    # Try to update with raw data
                    await update_sensor_data_internal_raw(cleaned_data)
                    return True
        
        return False
        
    except Exception as e:
        print(f"Error in fetch_and_process_iot_data: {e}")
        import traceback
        traceback.print_exc()
        return False

async def update_sensor_data_internal_raw(sensor_dict: Dict):
    """Internal function to update sensor data from raw dictionary"""
    global current_sensor_data
    
    try:
        # Update current data
        current_sensor_data.update(sensor_dict)
        
        # Add timestamp if not present
        if 'timestamp' not in current_sensor_data:
            current_sensor_data['timestamp'] = datetime.now().isoformat()
        
        # Process data
        processed_data = data_processor.process_sensor_data(current_sensor_data)
        
        # Make AI predictions
        predictions = predictor.predict(current_sensor_data)
        
        # Store historical data
        combined_data = {**processed_data, **predictions}
        data_processor.store_historical_data(combined_data)
        
        # Store prediction for analytics
        historical_predictions.append({
            'timestamp': datetime.now().isoformat(),
            'sensor_data': current_sensor_data.copy(),
            'predictions': predictions
        })
        
        # Keep only last 100 predictions
        if len(historical_predictions) > 100:
            historical_predictions.pop(0)
        
        print(f"Updated sensor data and generated predictions")
        
        return {
            "processed_data": processed_data,
            "predictions": predictions
        }
        
    except Exception as e:
        print(f"Error updating sensor data: {e}")
        import traceback
        traceback.print_exc()
        raise

async def update_sensor_data_internal(sensor_data: SensorData):
    """Internal function to update sensor data"""
    global current_sensor_data
    
    try:
        # Update current data
        sensor_dict = sensor_data.model_dump(exclude_none=True)
        current_sensor_data.update(sensor_dict)
        
        # Add timestamp if not present
        if 'timestamp' not in current_sensor_data:
            current_sensor_data['timestamp'] = datetime.now().isoformat()
        
        print(f"Current sensor data updated: {current_sensor_data}")
        
        # Process data
        processed_data = data_processor.process_sensor_data(current_sensor_data)
        
        # Make AI predictions
        predictions = predictor.predict(current_sensor_data)
        
        # Store historical data
        combined_data = {**processed_data, **predictions}
        data_processor.store_historical_data(combined_data)
        
        # Store prediction for analytics
        historical_predictions.append({
            'timestamp': datetime.now().isoformat(),
            'sensor_data': current_sensor_data.copy(),
            'predictions': predictions
        })
        
        # Keep only last 100 predictions
        if len(historical_predictions) > 100:
            historical_predictions.pop(0)
        
        print(f"Updated sensor data and generated predictions")
        
        return {
            "processed_data": processed_data,
            "predictions": predictions
        }
        
    except Exception as e:
        print(f"Error updating sensor data: {e}")
        import traceback
        traceback.print_exc()
        raise

# API Endpoints
@app.get("/", response_class=HTMLResponse)
async def get_dashboard():
    """Serve the dashboard HTML"""
    try:
        with open("templates/dashboard.html", "r") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Dashboard template not found</h1>")

@app.get("/api/data")
async def get_sensor_data():
    """Get current sensor data"""
    # Ensure we always return some data structure
    if not current_sensor_data or len(current_sensor_data) < 3:  # Minimum 3 readings
        # Return default structure with placeholders
        return {
            "ph_value": 6.8,
            "temperature": 25.5,
            "humidity": 65.0,
            "soil_percent": 55.0,
            "mq137_raw": 350.0,
            "rain_status": "No Rain",
            "flame_status": "No Flame",
            "timestamp": datetime.now().isoformat(),
            "iot_connected": False,
            "message": "Using default data"
        }
    
    # Add IoT connection status
    response_data = current_sensor_data.copy()
    response_data["iot_connected"] = True
    response_data["timestamp"] = datetime.now().isoformat()
    
    return response_data

@app.post("/api/update")
async def update_sensor_data(data: SensorData):
    """Update sensor data and trigger AI analysis"""
    try:
        result = await update_sensor_data_internal(data)
        
        return {
            "status": "success",
            "message": "Data updated successfully",
            **result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# IoT Integration Endpoints
@app.get("/api/iot/status")
async def get_iot_status():
    """Check IoT server connection status"""
    status = await iot_fetcher.check_connection()
    return status

@app.post("/api/iot/fetch")
async def fetch_iot_data():
    """Manually fetch data from IoT server"""
    try:
        success = await fetch_and_process_iot_data()
        if success:
            return {
                "status": "success",
                "message": "Data fetched and processed from IoT server"
            }
        else:
            return {
                "status": "error",
                "message": "Failed to fetch data from IoT server or no valid data available"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/iot/auto-fetch/start")
async def start_auto_fetch(interval: int = 10):
    """Start automatic data fetching from IoT server"""
    if not hasattr(app.state, 'auto_fetch_task') or app.state.auto_fetch_task.done():
        app.state.auto_fetch_task = asyncio.create_task(auto_fetch_task(interval))
        return {
            "status": "started",
            "message": f"Auto-fetch started with {interval} second interval",
            "interval": interval
        }
    return {
        "status": "already_running",
        "message": "Auto-fetch is already running"
    }

@app.post("/api/iot/auto-fetch/stop")
async def stop_auto_fetch():
    """Stop automatic data fetching"""
    if hasattr(app.state, 'auto_fetch_task'):
        app.state.auto_fetch_task.cancel()
        return {"status": "stopped", "message": "Auto-fetch stopped"}
    return {"status": "not_running", "message": "Auto-fetch is not running"}

@app.get("/api/iot/auto-fetch/status")
async def get_auto_fetch_status():
    """Get auto-fetch status"""
    if hasattr(app.state, 'auto_fetch_task'):
        return {
            "status": "running" if not app.state.auto_fetch_task.done() else "stopped",
            "task_exists": True
        }
    return {"status": "not_running", "task_exists": False}

# Original API endpoints
@app.get("/api/predictions")
async def get_predictions():
    """Get current AI predictions"""
    if not current_sensor_data:
        # Return mock predictions if no data
        return {
            "predictions": {
                "crop_yield": 0.75,
                "disease_risk": 0.2,
                "water_needs": 0.5,
                "fertilizer_needs": 0.4,
                "pest_risk": 0.3
            },
            "risk_analysis": {
                "overall_risk_score": 25,
                "risk_level": "low",
                "environmental_risks": {
                    "temperature_risk": 20,
                    "humidity_risk": 15,
                    "soil_moisture_risk": 10,
                    "ph_risk": 5
                }
            },
            "recommendations": {
                "crop_recommendations": [
                    {"crop_name": "Wheat", "suitability_score": 75, "suitability_level": "High", "season": "Rabi"},
                    {"crop_name": "Rice", "suitability_score": 65, "suitability_level": "Moderate", "season": "Kharif"}
                ],
                "product_recommendations": {
                    "fertilizers": [
                        {"name": "NPK 20-20-20", "brand": "AgroCare", "dosage": "100-150 kg/acre"}
                    ]
                },
                "insights": [
                    "Optimal conditions for maximum yield detected",
                    "Consider reducing irrigation frequency by 20%"
                ]
            },
            "future_predictions": {
                "predicted_yield": [0.75, 0.76, 0.77, 0.78, 0.79, 0.80, 0.81]
            }
        }
    
    try:
        predictions = predictor.predict(current_sensor_data)
        return predictions
    except Exception as e:
        print(f"Error getting predictions: {e}")
        # Return mock data if predictor fails
        return {
            "predictions": {
                "crop_yield": 0.75,
                "disease_risk": 0.2,
                "water_needs": 0.5,
                "fertilizer_needs": 0.4,
                "pest_risk": 0.3
            },
            "risk_analysis": {
                "overall_risk_score": 25,
                "risk_level": "low",
                "environmental_risks": {
                    "temperature_risk": 20,
                    "humidity_risk": 15,
                    "soil_moisture_risk": 10,
                    "ph_risk": 5
                }
            },
            "recommendations": {
                "crop_recommendations": [
                    {"crop_name": "Wheat", "suitability_score": 75, "suitability_level": "High", "season": "Rabi"},
                    {"crop_name": "Rice", "suitability_score": 65, "suitability_level": "Moderate", "season": "Kharif"}
                ],
                "product_recommendations": {
                    "fertilizers": [
                        {"name": "NPK 20-20-20", "brand": "AgroCare", "dosage": "100-150 kg/acre"}
                    ]
                },
                "insights": [
                    "Optimal conditions for maximum yield detected",
                    "Consider reducing irrigation frequency by 20%"
                ]
            },
            "future_predictions": {
                "predicted_yield": [0.75, 0.76, 0.77, 0.78, 0.79, 0.80, 0.81]
            }
        }

@app.get("/api/trends")
async def get_trends(days: int = 7):
    """Get trend analysis for specified period"""
    try:
        trends = data_processor.get_trend_analysis(days)
        return trends
    except Exception as e:
        print(f"Error getting trends: {e}")
        # Return mock trends
        return {
            "sensor_stats": {
                "temperature": {"average": 26.5, "min": 22, "max": 30, "trend": "stable"},
                "humidity": {"average": 65, "min": 55, "max": 75, "trend": "decreasing"},
                "ph_value": {"average": 6.8, "min": 6.5, "max": 7.0, "trend": "stable"},
                "soil_moisture_percent": {"average": 62, "min": 55, "max": 70, "trend": "increasing"}
            }
        }

@app.get("/api/historical")
async def get_historical_data(limit: int = 100):
    """Get historical data"""
    try:
        if not data_processor.historical_data.empty:
            df = data_processor.historical_data
            if len(df) > limit:
                df = df.tail(limit)
            return df.to_dict(orient='records')
        else:
            # Return mock historical data
            mock_data = []
            for i in range(min(limit, 20)):
                mock_data.append({
                    "timestamp": (datetime.now() - timedelta(hours=i)).isoformat(),
                    "ph_value": 6.8 + (i * 0.01),
                    "temperature": 25.5 + (i * 0.1),
                    "humidity": 65.0 - (i * 0.5),
                    "soil_percent": 55.0 + (i * 0.2),
                    "crop_yield": 0.75 + (i * 0.01)
                })
            return mock_data
    except Exception as e:
        print(f"Error getting historical data: {e}")
        return []

@app.get("/api/alerts")
async def get_alerts():
    """Get current alerts and warnings"""
    alerts = []
    
    if current_sensor_data:
        # Temperature alerts
        temp = current_sensor_data.get('temperature')
        if temp is not None:
            try:
                temp_val = float(temp) if isinstance(temp, str) else temp
                if temp_val > 35:
                    alerts.append({
                        "type": "warning",
                        "title": "High Temperature Alert",
                        "message": f"Temperature {temp_val}°C is above optimal range",
                        "severity": "high",
                        "timestamp": datetime.now().isoformat()
                    })
                elif temp_val < 10:
                    alerts.append({
                        "type": "warning",
                        "title": "Low Temperature Alert",
                        "message": f"Temperature {temp_val}°C is below optimal range",
                        "severity": "medium",
                        "timestamp": datetime.now().isoformat()
                    })
            except:
                pass
        
        # Humidity alerts
        humidity = current_sensor_data.get('humidity')
        if humidity is not None:
            try:
                humidity_val = float(humidity) if isinstance(humidity, str) else humidity
                if humidity_val > 85:
                    alerts.append({
                        "type": "warning",
                        "title": "High Humidity Alert",
                        "message": f"Humidity {humidity_val}% may cause fungal diseases",
                        "severity": "medium",
                        "timestamp": datetime.now().isoformat()
                    })
                elif humidity_val < 30:
                    alerts.append({
                        "type": "warning",
                        "title": "Low Humidity Alert",
                        "message": f"Humidity {humidity_val}% may cause water stress",
                        "severity": "medium",
                        "timestamp": datetime.now().isoformat()
                    })
            except:
                pass
        
        # pH alerts
        ph = current_sensor_data.get('ph_value')
        if ph is not None:
            try:
                ph_val = float(ph) if isinstance(ph, str) else ph
                if ph_val < 5.5:
                    alerts.append({
                        "type": "critical",
                        "title": "Acidic Soil Alert",
                        "message": f"pH {ph_val} is too acidic for most crops",
                        "severity": "high",
                        "timestamp": datetime.now().isoformat()
                    })
                elif ph_val > 7.5:
                    alerts.append({
                        "type": "critical",
                        "title": "Alkaline Soil Alert",
                        "message": f"pH {ph_val} is too alkaline for most crops",
                        "severity": "high",
                        "timestamp": datetime.now().isoformat()
                    })
            except:
                pass
        
        # Ammonia gas alert
        ammonia = current_sensor_data.get('mq137_raw')
        if ammonia is not None:
            try:
                ammonia_val = float(ammonia) if isinstance(ammonia, str) else ammonia
                if ammonia_val > 500:
                    alerts.append({
                        "type": "warning",
                        "title": "High Ammonia Level",
                        "message": f"Ammonia level {ammonia_val} ppm detected",
                        "severity": "medium",
                        "timestamp": datetime.now().isoformat()
                    })
            except:
                pass
        
        # Soil moisture alerts
        soil = current_sensor_data.get('soil_percent')
        if soil is not None:
            try:
                soil_val = float(soil) if isinstance(soil, str) else soil
                if soil_val < 20:
                    alerts.append({
                        "type": "warning",
                        "title": "Low Soil Moisture",
                        "message": f"Soil moisture {soil_val}% is very low",
                        "severity": "high",
                        "timestamp": datetime.now().isoformat()
                    })
                elif soil_val > 80:
                    alerts.append({
                        "type": "warning",
                        "title": "High Soil Moisture",
                        "message": f"Soil moisture {soil_val}% may cause root rot",
                        "severity": "medium",
                        "timestamp": datetime.now().isoformat()
                    })
            except:
                pass
    
    return alerts

@app.get("/api/analytics/summary")
async def get_analytics_summary():
    """Get analytics summary"""
    try:
        if data_processor.historical_data.empty:
            # Return mock summary
            return {
                "total_records": 20,
                "time_range": {
                    "start": (datetime.now() - timedelta(hours=20)).isoformat(),
                    "end": datetime.now().isoformat()
                },
                "averages": {
                    "ph_value": 6.8,
                    "temperature": 26.5,
                    "humidity": 65.0,
                    "soil_percent": 62.0
                },
                "recommendations": [
                    "Soil pH is within optimal range",
                    "Temperature conditions are favorable",
                    "Maintain current irrigation schedule"
                ]
            }
        
        df = data_processor.historical_data
        
        summary = {
            "total_records": len(df),
            "time_range": {
                "start": df['timestamp'].min() if 'timestamp' in df.columns else None,
                "end": df['timestamp'].max() if 'timestamp' in df.columns else None
            },
            "averages": {},
            "recommendations": []
        }
        
        # Calculate averages
        numeric_columns = ['ph_value', 'temperature', 'humidity', 'soil_percent']
        for col in numeric_columns:
            if col in df.columns:
                try:
                    summary['averages'][col] = float(df[col].mean())
                except:
                    pass
        
        # Generate recommendations based on averages
        avg_ph = summary['averages'].get('ph_value', 7.0)
        if avg_ph < 5.5:
            summary['recommendations'].append(
                "Soil is acidic. Consider applying agricultural lime."
            )
        elif avg_ph > 7.5:
            summary['recommendations'].append(
                "Soil is alkaline. Consider applying elemental sulfur."
            )
        
        avg_temp = summary['averages'].get('temperature', 25)
        if avg_temp > 30:
            summary['recommendations'].append(
                "Average temperature is high. Consider heat-resistant crop varieties."
            )
        
        avg_moisture = summary['averages'].get('soil_percent', 50)
        if avg_moisture < 30:
            summary['recommendations'].append("Soil moisture is low. Consider increasing irrigation.")
        elif avg_moisture > 70:
            summary['recommendations'].append("Soil moisture is high. Consider improving drainage.")
        
        return summary
        
    except Exception as e:
        print(f"Error getting analytics summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket for real-time updates
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Send initial data
        if current_sensor_data:
            predictions = predictor.predict(current_sensor_data)
            initial_data = {
                "type": "initial",
                "timestamp": datetime.now().isoformat(),
                "sensor_data": current_sensor_data,
                "predictions": predictions
            }
            await websocket.send_json(initial_data)
        
        while True:
            # Send updates every 2 seconds if data exists
            await asyncio.sleep(2)
            
            if current_sensor_data:
                # Get latest predictions
                predictions = predictor.predict(current_sensor_data)
                
                # Prepare update
                update = {
                    "type": "update",
                    "timestamp": datetime.now().isoformat(),
                    "sensor_data": current_sensor_data,
                    "predictions": predictions
                }
                
                await websocket.send_json(update)
    except Exception as e:
        print(f"WebSocket error: {e}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "predictor": "loaded" if predictor.models else "not loaded",
            "data_processor": "ready",
            "current_data": "available" if current_sensor_data else "unavailable",
            "iot_connection": await iot_fetcher.check_connection()
        }
    }

# Background task for auto-fetching
async def auto_fetch_task(interval_seconds: int = 10):
    """Background task to automatically fetch data from IoT server"""
    print(f"Starting auto-fetch task with {interval_seconds} second interval")
    
    while True:
        try:
            success = await fetch_and_process_iot_data()
            if success:
                print(f"Auto-fetch successful at {datetime.now().strftime('%H:%M:%S')}")
            else:
                print(f"Auto-fetch failed at {datetime.now().strftime('%H:%M:%S')}")
            await asyncio.sleep(interval_seconds)
        except asyncio.CancelledError:
            print("Auto-fetch task cancelled")
            break
        except Exception as e:
            print(f"Auto-fetch error: {e}")
            await asyncio.sleep(interval_seconds)

# Initialize on startup
@app.on_event("startup")
async def startup_event():
    """Initialize with data from IoT server"""
    try:
        # Load AI models
        predictor.load_models()
        
        # Initialize IoT fetcher
        await iot_fetcher.create_session()
        
        # Check IoT connection
        iot_status = await iot_fetcher.check_connection()
        print(f"IoT Server Status: {iot_status}")
        
        # Try to fetch initial data from IoT server
        print("Fetching initial data from IoT server...")
        success = await fetch_and_process_iot_data()
        
        if not success:
            print("Using initial default data...")
            # Ensure we have initial data for the dashboard
            if not current_sensor_data or len(current_sensor_data) < 3:
                current_sensor_data.update({
                    "ph_value": 6.8,
                    "temperature": 25.5,
                    "humidity": 65.0,
                    "soil_percent": 55.0,
                    "mq137_raw": 350.0,
                    "rain_status": "No Rain",
                    "flame_status": "No Flame",
                    "timestamp": datetime.now().isoformat()
                })
        
        # Start auto-fetch after 5 seconds
        await asyncio.sleep(5)
        app.state.auto_fetch_task = asyncio.create_task(auto_fetch_task(15))
        
        print("Smart Farming AI System initialized successfully!")
        print(f"Dashboard URL: http://localhost:8000")
        print(f"API Documentation: http://localhost:8000/docs")
        
    except Exception as e:
        print(f"Startup error: {e}")
        import traceback
        traceback.print_exc()

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    try:
        # Stop auto-fetch task
        if hasattr(app.state, 'auto_fetch_task'):
            app.state.auto_fetch_task.cancel()
        
        # Close IoT fetcher session
        await iot_fetcher.close()
        
    except Exception as e:
        print(f"Shutdown error: {e}")

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("Smart Farming AI Analytics Server")
    print("=" * 60)
    print(f"IoT Server: {IOT_SERVER_URL}")
    print(f"Local Dashboard: http://127.0.0.1:8000")
    print("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")