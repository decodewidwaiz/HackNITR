import numpy as np
import pandas as pd
from tensorflow import keras
import joblib
from typing import Dict, List, Any

class FarmPredictor:
    def __init__(self):
        self.models = {}
        self.scaler = None
        self.load_models()
        
        # Crop recommendations database
        self.crop_database = {
            'rice': {
                'ph_range': (5.0, 7.5),
                'temp_range': (20, 35),
                'humidity_range': (60, 90),
                'soil_moisture': (60, 80),
                'water_needs': 'High',
                'fertilizer_needs': 'Medium-High',
                'season': ['Kharif', 'Rabi'],
                'regions': ['West Bengal', 'Punjab', 'Uttar Pradesh']
            },
            'wheat': {
                'ph_range': (6.0, 7.5),
                'temp_range': (15, 25),
                'humidity_range': (40, 70),
                'soil_moisture': (50, 70),
                'water_needs': 'Medium',
                'fertilizer_needs': 'Medium',
                'season': ['Rabi'],
                'regions': ['Punjab', 'Haryana', 'Uttar Pradesh']
            },
            'maize': {
                'ph_range': (5.5, 7.5),
                'temp_range': (18, 32),
                'humidity_range': (50, 80),
                'soil_moisture': (50, 70),
                'water_needs': 'Medium-High',
                'fertilizer_needs': 'High',
                'season': ['Kharif', 'Rabi'],
                'regions': ['Karnataka', 'Madhya Pradesh', 'Rajasthan']
            },
            'cotton': {
                'ph_range': (5.5, 8.0),
                'temp_range': (20, 40),
                'humidity_range': (40, 70),
                'soil_moisture': (40, 60),
                'water_needs': 'Medium',
                'fertilizer_needs': 'High',
                'season': ['Kharif'],
                'regions': ['Gujarat', 'Maharashtra', 'Punjab']
            },
            'sugarcane': {
                'ph_range': (6.0, 8.0),
                'temp_range': (20, 35),
                'humidity_range': (50, 85),
                'soil_moisture': (60, 80),
                'water_needs': 'Very High',
                'fertilizer_needs': 'Very High',
                'season': ['Kharif'],
                'regions': ['Uttar Pradesh', 'Maharashtra', 'Karnataka']
            },
            'potato': {
                'ph_range': (5.0, 6.5),
                'temp_range': (15, 25),
                'humidity_range': (50, 80),
                'soil_moisture': (60, 80),
                'water_needs': 'Medium-High',
                'fertilizer_needs': 'Medium',
                'season': ['Rabi'],
                'regions': ['Uttar Pradesh', 'West Bengal', 'Punjab']
            },
            'tomato': {
                'ph_range': (5.5, 7.0),
                'temp_range': (18, 30),
                'humidity_range': (40, 70),
                'soil_moisture': (50, 70),
                'water_needs': 'Medium',
                'fertilizer_needs': 'Medium-High',
                'season': ['Kharif', 'Rabi'],
                'regions': ['Maharashtra', 'Karnataka', 'Andhra Pradesh']
            }
        }
        
        # Product recommendations database
        self.product_database = {
            'soil_conditioners': {
                'acidic_soil': [
                    {'name': 'Agricultural Lime', 'brand': 'FarmTech', 'dosage': '2-4 tons/acre'},
                    {'name': 'Dolomite Lime', 'brand': 'AgroCare', 'dosage': '1-3 tons/acre'},
                    {'name': 'Calcium Carbonate', 'brand': 'SoilFix', 'dosage': '3-5 tons/acre'}
                ],
                'alkaline_soil': [
                    {'name': 'Elemental Sulfur', 'brand': 'pH Balance', 'dosage': '500-1000 kg/acre'},
                    {'name': 'Aluminum Sulfate', 'brand': 'AgroTech', 'dosage': '200-500 kg/acre'},
                    {'name': 'Ferrous Sulfate', 'brand': 'GreenSoil', 'dosage': '300-600 kg/acre'}
                ]
            },
            'fertilizers': {
                'nitrogen_deficient': [
                    {'name': 'Urea', 'brand': 'IFFCO', 'dosage': '100-150 kg/acre'},
                    {'name': 'Ammonium Sulfate', 'brand': 'Coromandel', 'dosage': '150-200 kg/acre'},
                    {'name': 'Calcium Nitrate', 'brand': 'Yara', 'dosage': '50-100 kg/acre'}
                ],
                'phosphorus_deficient': [
                    {'name': 'DAP', 'brand': 'IFFCO', 'dosage': '100-150 kg/acre'},
                    {'name': 'SSP', 'brand': 'Coromandel', 'dosage': '200-300 kg/acre'},
                    {'name': 'Bone Meal', 'brand': 'OrganicFarm', 'dosage': '500-800 kg/acre'}
                ],
                'potassium_deficient': [
                    {'name': 'MOP', 'brand': 'IFFCO', 'dosage': '50-100 kg/acre'},
                    {'name': 'SOP', 'brand': 'Yara', 'dosage': '100-150 kg/acre'},
                    {'name': 'Potassium Nitrate', 'brand': 'Haifa', 'dosage': '50-100 kg/acre'}
                ]
            },
            'pesticides': {
                'high_pest_risk': [
                    {'name': 'Neem Oil', 'brand': 'BioCare', 'type': 'Organic', 'dosage': '2-5 ml/liter'},
                    {'name': 'Chlorpyrifos', 'brand': 'Bayer', 'type': 'Chemical', 'dosage': '1-2 ml/liter'},
                    {'name': 'Imidacloprid', 'brand': 'Syngenta', 'type': 'Systemic', 'dosage': '0.5-1 ml/liter'}
                ],
                'fungal_disease': [
                    {'name': 'Copper Oxychloride', 'brand': 'Indofil', 'dosage': '2-3 g/liter'},
                    {'name': 'Carbendazim', 'brand': 'Bayer', 'dosage': '1-2 g/liter'},
                    {'name': 'Mancozeb', 'brand': 'UPL', 'dosage': '2-3 g/liter'}
                ]
            },
            'irrigation_systems': {
                'water_scarce': [
                    {'name': 'Drip Irrigation Kit', 'brand': 'Jain Irrigation', 'coverage': '1 acre'},
                    {'name': 'Sprinkler System', 'brand': 'Netafim', 'coverage': '2 acres'},
                    {'name': 'Solar Pump System', 'brand': 'Crompton', 'capacity': '5 HP'}
                ]
            }
        }
    
    def load_models(self):
        """Load trained models"""
        try:
            # Load neural network model
            self.models['crop_yield'] = keras.models.load_model('models/crop_yield_model.h5')
            
            # Load other models
            import joblib
            self.models['disease_risk'] = joblib.load('models/disease_risk_model.pkl')
            self.models['water_needs'] = joblib.load('models/water_needs_model.pkl')
            self.models['fertilizer_needs'] = joblib.load('models/fertilizer_needs_model.pkl')
            self.models['pest_risk'] = joblib.load('models/pest_risk_model.pkl')
            
            # Load scaler
            self.scaler = joblib.load('models/feature_scaler.pkl')
            
            print("AI Models loaded successfully!")
            return True
        except Exception as e:
            print(f"Error loading models: {e}")
            return False
    
    def predict(self, sensor_data: Dict[str, float]) -> Dict[str, Any]:
        """Make predictions based on sensor data"""
        try:
            # Prepare features
            features = np.array([
                sensor_data.get('ph_value', 7.0),
                sensor_data.get('ph_voltage', 2.5),
                sensor_data.get('mq137_raw', 300),
                sensor_data.get('temperature', 25),
                sensor_data.get('humidity', 60),
                sensor_data.get('soil_raw', 500)
            ]).reshape(1, -1)
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Make predictions
            predictions = {
                'crop_yield': float(self.models['crop_yield'].predict(features_scaled)[0][0]),
                'disease_risk': float(self.models['disease_risk'].predict(features_scaled)[0]),
                'water_needs': float(self.models['water_needs'].predict(features_scaled)[0]),
                'fertilizer_needs': float(self.models['fertilizer_needs'].predict(features_scaled)[0]),
                'pest_risk': float(self.models['pest_risk'].predict(features_scaled)[0])
            }
            
            # Calculate risk scores
            risk_analysis = self._calculate_risk_analysis(predictions, sensor_data)
            
            # Get crop recommendations
            crop_recommendations = self._recommend_crops(sensor_data)
            
            # Get product recommendations
            product_recommendations = self._recommend_products(predictions, sensor_data)
            
            # Generate insights
            insights = self._generate_insights(predictions, sensor_data)
            
            # Prepare time series predictions
            future_predictions = self._predict_future_trends(sensor_data)
            
            return {
                'predictions': predictions,
                'risk_analysis': risk_analysis,
                'crop_recommendations': crop_recommendations,
                'product_recommendations': product_recommendations,
                'insights': insights,
                'future_predictions': future_predictions
            }
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return {}
    
    def _calculate_risk_analysis(self, predictions: Dict, sensor_data: Dict) -> Dict:
        """Calculate comprehensive risk analysis"""
        
        # Individual risk scores (0-100)
        disease_risk_score = min(predictions['disease_risk'] * 100, 100)
        pest_risk_score = min(predictions['pest_risk'] * 100, 100)
        
        # Environmental risks
        temp_risk = 0
        if sensor_data.get('temperature', 25) > 35:
            temp_risk = 60
        elif sensor_data.get('temperature', 25) < 10:
            temp_risk = 40
            
        humidity_risk = 0
        if sensor_data.get('humidity', 60) > 85:
            humidity_risk = 70
        elif sensor_data.get('humidity', 60) < 30:
            humidity_risk = 50
            
        soil_risk = 0
        soil_raw = sensor_data.get('soil_raw', 500)
        if soil_raw > 700:
            soil_risk = 60  # Too wet
        elif soil_raw < 300:
            soil_risk = 70  # Too dry
            
        ph_risk = 0
        ph_value = sensor_data.get('ph_value', 7.0)
        if ph_value < 5.5 or ph_value > 7.5:
            ph_risk = 80
            
        # Overall risk score (weighted average)
        overall_risk = (
            disease_risk_score * 0.3 +
            pest_risk_score * 0.2 +
            temp_risk * 0.15 +
            humidity_risk * 0.15 +
            soil_risk * 0.1 +
            ph_risk * 0.1
        )
        
        risk_level = "Low"
        if overall_risk > 70:
            risk_level = "Critical"
        elif overall_risk > 50:
            risk_level = "High"
        elif overall_risk > 30:
            risk_level = "Medium"
        
        return {
            'overall_risk_score': round(overall_risk, 1),
            'risk_level': risk_level,
            'disease_risk_score': round(disease_risk_score, 1),
            'pest_risk_score': round(pest_risk_score, 1),
            'environmental_risks': {
                'temperature_risk': temp_risk,
                'humidity_risk': humidity_risk,
                'soil_moisture_risk': soil_risk,
                'ph_risk': ph_risk
            },
            'recommended_actions': self._get_risk_mitigation_actions(overall_risk, predictions)
        }
    
    def _get_risk_mitigation_actions(self, risk_score: float, predictions: Dict) -> List[str]:
        """Get risk mitigation actions based on risk score"""
        actions = []
        
        if predictions['disease_risk'] > 0.6:
            actions.append("Apply preventive fungicide spray")
            actions.append("Improve air circulation around plants")
            
        if predictions['pest_risk'] > 0.5:
            actions.append("Install pheromone traps")
            actions.append("Apply neem-based pesticide")
            
        if risk_score > 50:
            actions.append("Increase monitoring frequency to daily")
            actions.append("Consult agricultural expert")
            
        if predictions['fertilizer_needs'] > 0.7:
            actions.append("Apply balanced NPK fertilizer")
            actions.append("Consider soil testing")
            
        if predictions['water_needs'] > 0.8:
            actions.append("Implement drip irrigation")
            actions.append("Add organic matter to improve water retention")
            
        return actions if actions else ["Conditions are optimal. Continue current practices."]
    
    def _recommend_crops(self, sensor_data: Dict) -> List[Dict]:
        """Recommend suitable crops based on soil conditions"""
        recommended_crops = []
        
        for crop, requirements in self.crop_database.items():
            score = 0
            reasons = []
            
            # Check pH compatibility
            ph_value = sensor_data.get('ph_value', 7.0)
            ph_min, ph_max = requirements['ph_range']
            if ph_min <= ph_value <= ph_max:
                score += 25
                reasons.append(f"pH {ph_value} is suitable")
            else:
                reasons.append(f"pH adjustment needed (optimal: {ph_min}-{ph_max})")
            
            # Check temperature compatibility
            temp = sensor_data.get('temperature', 25)
            temp_min, temp_max = requirements['temp_range']
            if temp_min <= temp <= temp_max:
                score += 25
                reasons.append(f"Temperature {temp}°C is suitable")
            else:
                reasons.append(f"Temperature outside optimal range ({temp_min}-{temp_max}°C)")
            
            # Check humidity compatibility
            humidity = sensor_data.get('humidity', 60)
            hum_min, hum_max = requirements['humidity_range']
            if hum_min <= humidity <= hum_max:
                score += 25
                reasons.append(f"Humidity {humidity}% is suitable")
            else:
                reasons.append(f"Humidity outside optimal range ({hum_min}-{hum_max}%)")
            
            # Check soil moisture compatibility
            soil_raw = sensor_data.get('soil_raw', 500)
            soil_moisture = (800 - soil_raw) / 800 * 100
            soil_min, soil_max = requirements['soil_moisture']
            if soil_min <= soil_moisture <= soil_max:
                score += 25
                reasons.append(f"Soil moisture {soil_moisture:.1f}% is suitable")
            else:
                reasons.append(f"Soil moisture adjustment needed (optimal: {soil_min}-{soil_max}%)")
            
            if score >= 75:  # Highly suitable
                suitability = "Highly Suitable"
            elif score >= 50:  # Moderately suitable
                suitability = "Moderately Suitable"
            else:
                suitability = "Not Recommended"
            
            recommended_crops.append({
                'crop_name': crop.title(),
                'suitability_score': score,
                'suitability_level': suitability,
                'reasons': reasons,
                'requirements': requirements
            })
        
        # Sort by suitability score
        recommended_crops.sort(key=lambda x: x['suitability_score'], reverse=True)
        return recommended_crops[:5]  # Return top 5 recommendations
    
    def _recommend_products(self, predictions: Dict, sensor_data: Dict) -> Dict:
        """Recommend agricultural products based on conditions"""
        products = {}
        
        # Soil conditioners
        ph_value = sensor_data.get('ph_value', 7.0)
        if ph_value < 5.5:
            products['soil_conditioners'] = self.product_database['soil_conditioners']['acidic_soil']
        elif ph_value > 7.5:
            products['soil_conditioners'] = self.product_database['soil_conditioners']['alkaline_soil']
        
        # Fertilizers based on predictions
        if predictions['fertilizer_needs'] > 0.7:
            products['fertilizers'] = self.product_database['fertilizers']['nitrogen_deficient']
        
        # Pesticides based on risk
        if predictions['pest_risk'] > 0.6:
            products['pesticides'] = self.product_database['pesticides']['high_pest_risk']
        
        if predictions['disease_risk'] > 0.6:
            products['fungicides'] = self.product_database['pesticides']['fungal_disease']
        
        # Irrigation systems based on water needs
        if predictions['water_needs'] > 0.7:
            products['irrigation_systems'] = self.product_database['irrigation_systems']['water_scarce']
        
        return products
    
    def _generate_insights(self, predictions: Dict, sensor_data: Dict) -> List[str]:
        """Generate actionable insights from predictions"""
        insights = []
        
        # Crop yield insights
        if predictions['crop_yield'] > 0.8:
            insights.append("Excellent conditions for maximum crop yield")
        elif predictions['crop_yield'] < 0.4:
            insights.append("Low predicted yield. Consider soil amendments")
        
        # Disease risk insights
        if predictions['disease_risk'] > 0.7:
            insights.append("High disease risk detected. Implement preventive measures immediately")
        elif predictions['disease_risk'] < 0.3:
            insights.append("Low disease risk. Current preventive measures are effective")
        
        # Water management insights
        water_needs = predictions['water_needs']
        if water_needs > 0.8:
            insights.append("High water requirement. Consider efficient irrigation methods")
        elif water_needs < 0.3:
            insights.append("Low water requirement. Reduce irrigation frequency to prevent waterlogging")
        
        # Fertilizer insights
        if predictions['fertilizer_needs'] > 0.7:
            insights.append("High fertilizer requirement detected. Soil may be nutrient-deficient")
        elif predictions['fertilizer_needs'] < 0.3:
            insights.append("Low fertilizer requirement. Avoid over-fertilization")
        
        # Pest management insights
        if predictions['pest_risk'] > 0.6:
            insights.append("High pest infestation risk. Monitor crops closely and prepare control measures")
        
        # Environmental insights
        temp = sensor_data.get('temperature', 25)
        if temp > 35:
            insights.append("High temperature may stress plants. Consider shade nets or misting")
        elif temp < 15:
            insights.append("Low temperature may slow plant growth. Consider protective covers")
        
        humidity = sensor_data.get('humidity', 60)
        if humidity > 85:
            insights.append("High humidity increases fungal disease risk. Improve ventilation")
        elif humidity < 30:
            insights.append("Low humidity may cause water stress. Increase irrigation frequency")
        
        return insights
    
    def _predict_future_trends(self, sensor_data: Dict) -> Dict:
        """Predict future trends based on current data"""
        import numpy as np
        
        # Simulate future predictions (7 days)
        days = 7
        current_temp = sensor_data.get('temperature', 25)
        current_humidity = sensor_data.get('humidity', 60)
        current_soil = sensor_data.get('soil_raw', 500)
        
        # Generate future predictions with some randomness
        future_data = {
            'days': list(range(1, days + 1)),
            'predicted_yield': [],
            'predicted_disease_risk': [],
            'predicted_pest_risk': [],
            'predicted_temperature': [],
            'predicted_humidity': []
        }
        
        for day in range(1, days + 1):
            # Temperature prediction (with seasonal variation)
            temp_variation = np.sin(day * 0.5) * 3
            future_data['predicted_temperature'].append(current_temp + temp_variation)
            
            # Humidity prediction
            hum_variation = np.cos(day * 0.3) * 10
            future_data['predicted_humidity'].append(
                max(20, min(90, current_humidity + hum_variation))
            )
            
            # Yield prediction (affected by conditions)
            temp_effect = 1.0 - abs(25 - future_data['predicted_temperature'][-1]) / 50
            hum_effect = 1.0 - abs(60 - future_data['predicted_humidity'][-1]) / 80
            daily_yield = (temp_effect * 0.5 + hum_effect * 0.5) * 0.9 ** (day - 1)
            future_data['predicted_yield'].append(daily_yield)
            
            # Disease risk prediction
            disease_base = sensor_data.get('disease_risk', 0.3)
            disease_increase = (future_data['predicted_humidity'][-1] - 60) / 100
            future_data['predicted_disease_risk'].append(
                min(1.0, max(0, disease_base + disease_increase))
            )
            
            # Pest risk prediction
            pest_base = sensor_data.get('pest_risk', 0.3)
            temp_factor = max(0, (future_data['predicted_temperature'][-1] - 25) / 30)
            future_data['predicted_pest_risk'].append(
                min(1.0, max(0, pest_base + temp_factor * 0.2))
            )
        
        return future_data