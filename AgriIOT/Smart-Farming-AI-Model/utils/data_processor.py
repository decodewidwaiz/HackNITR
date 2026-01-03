import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

class DataProcessor:
    def __init__(self):
        self.historical_data = pd.DataFrame()
    
    def process_sensor_data(self, sensor_data: dict) -> dict:
        """Process raw sensor data for analysis"""
        processed = sensor_data.copy()
        
        # Convert raw values to percentages where applicable
        if 'soil_raw' in processed:
            # Convert soil raw ADC to percentage (assuming 0-1023 range)
            soil_raw = processed['soil_raw']
            if 0 <= soil_raw <= 1023:
                processed['soil_moisture_percent'] = ((1023 - soil_raw) / 1023) * 100
        
        # Calculate soil fertility index
        processed['fertility_index'] = self._calculate_fertility_index(processed)
        
        # Calculate plant health score
        processed['plant_health_score'] = self._calculate_plant_health(processed)
        
        # Add timestamp
        processed['timestamp'] = datetime.now().isoformat()
        
        return processed
    
    def _calculate_fertility_index(self, data: dict) -> float:
        """Calculate soil fertility index (0-100)"""
        index = 50  # Base score
        
        # pH contribution
        ph = data.get('ph_value', 7.0)
        if 6.0 <= ph <= 7.0:
            index += 20
        elif 5.5 <= ph <= 7.5:
            index += 10
        else:
            index -= 20
        
        # Soil moisture contribution
        soil_moisture = data.get('soil_moisture_percent', 50)
        if 40 <= soil_moisture <= 70:
            index += 15
        elif 30 <= soil_moisture <= 80:
            index += 5
        else:
            index -= 15
        
        # Temperature contribution
        temp = data.get('temperature', 25)
        if 20 <= temp <= 30:
            index += 15
        elif 15 <= temp <= 35:
            index += 5
        else:
            index -= 10
        
        # Humidity contribution
        humidity = data.get('humidity', 60)
        if 50 <= humidity <= 70:
            index += 10
        else:
            index -= 5
        
        return max(0, min(100, index))
    
    def _calculate_plant_health(self, data: dict) -> float:
        """Calculate overall plant health score (0-100)"""
        health = 70  # Base health
        
        # Adjust based on conditions
        disease_risk = data.get('disease_risk', 0.3)
        health -= disease_risk * 30
        
        pest_risk = data.get('pest_risk', 0.3)
        health -= pest_risk * 20
        
        # Temperature stress
        temp = data.get('temperature', 25)
        if temp > 35 or temp < 10:
            health -= 15
        elif temp > 30 or temp < 15:
            health -= 5
        
        # Soil moisture stress
        soil_moisture = data.get('soil_moisture_percent', 50)
        if soil_moisture < 30 or soil_moisture > 80:
            health -= 20
        elif soil_moisture < 40 or soil_moisture > 70:
            health -= 10
        
        return max(0, min(100, health))
    
    def store_historical_data(self, data: dict, filename: str = 'historical_data.csv'):
        """Store processed data for historical analysis"""
        try:
            df = pd.DataFrame([data])
            
            # Load existing data if available
            try:
                existing_df = pd.read_csv(f'static/data/{filename}')
                df = pd.concat([existing_df, df], ignore_index=True)
            except FileNotFoundError:
                pass
            
            # Keep only last 1000 records
            if len(df) > 1000:
                df = df.tail(1000)
            
            # Save to file
            df.to_csv(f'static/data/{filename}', index=False)
            self.historical_data = df
            
            return True
        except Exception as e:
            print(f"Error storing historical data: {e}")
            return False
    
    def get_trend_analysis(self, days: int = 7) -> dict:
        """Analyze trends from historical data"""
        if self.historical_data.empty:
            return {}
        
        # Convert timestamp to datetime
        df = self.historical_data.copy()
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Get data for specified days
        cutoff = datetime.now() - timedelta(days=days)
        recent_data = df[df['timestamp'] >= cutoff]
        
        if recent_data.empty:
            return {}
        
        trend_analysis = {
            'period_days': days,
            'sensor_stats': {},
            'trends': {},
            'anomalies': []
        }
        
        # Calculate statistics for each sensor
        sensors = ['ph_value', 'temperature', 'humidity', 'soil_moisture_percent']
        for sensor in sensors:
            if sensor in recent_data.columns:
                values = recent_data[sensor].dropna()
                if len(values) > 0:
                    trend_analysis['sensor_stats'][sensor] = {
                        'current': float(values.iloc[-1]) if len(values) > 0 else None,
                        'average': float(values.mean()),
                        'min': float(values.min()),
                        'max': float(values.max()),
                        'trend': self._calculate_trend(values)
                    }
        
        # Detect anomalies
        trend_analysis['anomalies'] = self._detect_anomalies(recent_data)
        
        return trend_analysis
    
    def _calculate_trend(self, series: pd.Series) -> str:
        """Calculate trend direction"""
        if len(series) < 2:
            return "stable"
        
        # Use linear regression for trend
        x = np.arange(len(series))
        y = series.values
        
        # Simple trend calculation
        first_half = np.mean(y[:len(y)//2])
        second_half = np.mean(y[len(y)//2:])
        
        change = ((second_half - first_half) / first_half * 100) if first_half != 0 else 0
        
        if change > 5:
            return "increasing"
        elif change < -5:
            return "decreasing"
        else:
            return "stable"
    
    def _detect_anomalies(self, df: pd.DataFrame) -> list:
        """Detect anomalies in sensor data"""
        anomalies = []
        
        # Check for sudden changes
        for column in ['temperature', 'humidity', 'ph_value']:
            if column in df.columns:
                values = df[column].dropna()
                if len(values) > 10:
                    # Calculate moving average and standard deviation
                    window = min(5, len(values))
                    rolling_mean = values.rolling(window=window, center=True).mean()
                    rolling_std = values.rolling(window=window, center=True).std()
                    
                    # Find values outside 2 standard deviations
                    z_scores = (values - rolling_mean) / rolling_std
                    anomaly_indices = np.where(np.abs(z_scores) > 2)[0]
                    
                    for idx in anomaly_indices:
                        if idx < len(df):
                            timestamp = df.iloc[idx]['timestamp']
                            anomalies.append({
                                'sensor': column,
                                'timestamp': str(timestamp),
                                'value': float(values.iloc[idx]),
                                'expected_range': f"{rolling_mean.iloc[idx]:.1f} ± {rolling_std.iloc[idx]:.1f}",
                                'severity': 'high' if abs(z_scores.iloc[idx]) > 3 else 'medium'
                            })
        
        return anomalies