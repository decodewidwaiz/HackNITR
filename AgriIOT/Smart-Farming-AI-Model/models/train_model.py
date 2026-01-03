import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import joblib
import warnings
warnings.filterwarnings('ignore')

class FarmAIModel:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_columns = ['ph_value', 'ph_voltage', 'mq137_raw', 
                               'temperature', 'humidity', 'soil_raw']
        self.target_columns = ['crop_yield', 'disease_risk', 'water_needs', 
                              'fertilizer_needs', 'pest_risk']
        
    def generate_synthetic_data(self, n_samples=10000):
        """Generate synthetic agricultural data for training"""
        np.random.seed(42)
        
        data = {
            'ph_value': np.random.uniform(4.0, 8.5, n_samples),
            'ph_voltage': np.random.uniform(1.5, 3.5, n_samples),
            'mq137_raw': np.random.uniform(100, 1000, n_samples),
            'temperature': np.random.uniform(15, 40, n_samples),
            'humidity': np.random.uniform(30, 90, n_samples),
            'soil_raw': np.random.uniform(200, 800, n_samples),
            'rain_status': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
            'flame_status': np.random.choice([0, 1], n_samples, p=[0.95, 0.05])
        }
        
        df = pd.DataFrame(data)
        
        # Generate targets in correct order
        df['disease_risk'] = self._calculate_disease_risk(df)
        df['pest_risk'] = self._calculate_pest_risk(df)
        df['crop_yield'] = self._calculate_yield(df)
        df['water_needs'] = self._calculate_water_needs(df)
        df['fertilizer_needs'] = self._calculate_fertilizer_needs(df)
        
        return df
    
    def _calculate_yield(self, df):
        """Calculate crop yield based on soil conditions"""
        yield_score = (
            (df['ph_value'].between(6.0, 7.0) * 0.3) +
            (df['soil_raw'].between(400, 600) * 0.2) +
            (df['temperature'].between(20, 30) * 0.2) +
            (df['humidity'].between(50, 70) * 0.15) +
            (1 - df['disease_risk'] * 0.15)
        )
        return yield_score * np.random.uniform(0.8, 1.2, len(df))
    
    def _calculate_disease_risk(self, df):
        """Calculate disease risk probability"""
        risk = (
            (df['humidity'] > 80) * 0.3 +
            (df['temperature'] > 35) * 0.2 +
            (df['ph_value'] < 5.5) * 0.2 +
            (df['mq137_raw'] > 500) * 0.15 +
            (df['soil_raw'] > 700) * 0.15
        )
        return np.clip(risk / 1.0, 0, 1)
    
    def _calculate_water_needs(self, df):
        """Calculate water requirements"""
        water = (
            (df['soil_raw'] / 800) * 0.4 +
            (df['temperature'] / 40) * 0.3 +
            (1 - df['humidity'] / 100) * 0.3
        )
        return np.clip(water, 0.1, 1.0)
    
    def _calculate_fertilizer_needs(self, df):
        """Calculate fertilizer requirements"""
        fertilizer = (
            (df['ph_value'] < 6.0) * 0.3 +
            (df['soil_raw'] < 300) * 0.4 +
            (df['mq137_raw'] < 200) * 0.3
        )
        return np.clip(fertilizer, 0, 1)
    
    def _calculate_pest_risk(self, df):
        """Calculate pest infestation risk"""
        pest_risk = (
            (df['temperature'].between(25, 35)) * 0.3 +
            (df['humidity'].between(60, 80)) * 0.3 +
            (df['rain_status'] == 1) * 0.2 +
            (df['ph_value'] > 7.5) * 0.2
        )
        return np.clip(pest_risk, 0, 1)
    
    def train_models(self):
        """Train all prediction models"""
        print("Generating synthetic data...")
        df = self.generate_synthetic_data(n_samples=5000)  # Reduced for faster training
        
        print(f"Data shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")
        print(f"Sample data:\n{df.head()}")
        
        print("\nPreparing features and targets...")
        X = df[self.feature_columns].values
        
        # Split data for each target
        X_train, X_test = train_test_split(X, test_size=0.2, random_state=42)
        
        # Scale features
        self.scalers['features'] = StandardScaler()
        X_train_scaled = self.scalers['features'].fit_transform(X_train)
        X_test_scaled = self.scalers['features'].transform(X_test)
        
        print("\nTraining models...")
        
        # 1. Crop Yield Prediction (Neural Network)
        print("\nTraining Crop Yield Model...")
        y_crop = df['crop_yield'].values
        _, _, y_crop_train, y_crop_test = train_test_split(
            X, y_crop, test_size=0.2, random_state=42
        )
        
        self.models['crop_yield'] = self._build_nn_model()
        history = self.models['crop_yield'].fit(
            X_train_scaled, y_crop_train,
            validation_split=0.2,
            epochs=30,  # Reduced epochs for faster training
            batch_size=32,
            verbose=0
        )
        print(f"Crop Yield Model - Final Loss: {history.history['loss'][-1]:.4f}")
        
        # 2. Disease Risk Prediction (Random Forest)
        print("\nTraining Disease Risk Model...")
        y_disease = df['disease_risk'].values
        _, _, y_disease_train, y_disease_test = train_test_split(
            X, y_disease, test_size=0.2, random_state=42
        )
        
        self.models['disease_risk'] = RandomForestRegressor(
            n_estimators=50,  # Reduced for faster training
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.models['disease_risk'].fit(X_train_scaled, y_disease_train)
        
        # 3. Water Needs Prediction
        print("\nTraining Water Needs Model...")
        y_water = df['water_needs'].values
        _, _, y_water_train, y_water_test = train_test_split(
            X, y_water, test_size=0.2, random_state=42
        )
        
        self.models['water_needs'] = GradientBoostingRegressor(
            n_estimators=50,  # Reduced for faster training
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.models['water_needs'].fit(X_train_scaled, y_water_train)
        
        # 4. Fertilizer Needs Prediction
        print("\nTraining Fertilizer Needs Model...")
        y_fertilizer = df['fertilizer_needs'].values
        _, _, y_fertilizer_train, y_fertilizer_test = train_test_split(
            X, y_fertilizer, test_size=0.2, random_state=42
        )
        
        self.models['fertilizer_needs'] = RandomForestRegressor(
            n_estimators=50,  # Reduced for faster training
            max_depth=8,
            random_state=42,
            n_jobs=-1
        )
        self.models['fertilizer_needs'].fit(X_train_scaled, y_fertilizer_train)
        
        # 5. Pest Risk Prediction
        print("\nTraining Pest Risk Model...")
        y_pest = df['pest_risk'].values
        _, _, y_pest_train, y_pest_test = train_test_split(
            X, y_pest, test_size=0.2, random_state=42
        )
        
        self.models['pest_risk'] = GradientBoostingRegressor(
            n_estimators=40,  # Reduced for faster training
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        self.models['pest_risk'].fit(X_train_scaled, y_pest_train)
        
        # Evaluate models
        print("\n" + "="*50)
        print("MODEL EVALUATION RESULTS")
        print("="*50)
        
        models_to_evaluate = [
            ('crop_yield', y_crop_test),
            ('disease_risk', y_disease_test),
            ('water_needs', y_water_test),
            ('fertilizer_needs', y_fertilizer_test),
            ('pest_risk', y_pest_test)
        ]
        
        for model_name, y_test in models_to_evaluate:
            if model_name == 'crop_yield':
                y_pred = self.models[model_name].predict(X_test_scaled).flatten()
            else:
                y_pred = self.models[model_name].predict(X_test_scaled)
            
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)
            
            print(f"\n{model_name.replace('_', ' ').title():20}")
            print(f"  MAE:  {mae:.4f}")
            print(f"  RMSE: {rmse:.4f}")
            print(f"  R²:   {r2:.4f}")
        
        # Save models
        self.save_models()
        
    def _build_nn_model(self):
        """Build neural network model"""
        model = keras.Sequential([
            layers.Dense(32, activation='relu', input_shape=(6,)),
            layers.Dropout(0.2),
            layers.Dense(16, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(8, activation='relu'),
            layers.Dense(1, activation='linear')
        ])
        
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def save_models(self):
        """Save trained models and scalers"""
        import os
        
        # Create models directory if it doesn't exist
        os.makedirs('../models', exist_ok=True)
        
        try:
            # Save NN model
            self.models['crop_yield'].save('../models/crop_yield_model.h5')
            print("\n✓ Crop Yield model saved")
            
            # Save other models
            for name, model in self.models.items():
                if name != 'crop_yield':
                    joblib.dump(model, f'../models/{name}_model.pkl')
                    print(f"✓ {name.replace('_', ' ').title()} model saved")
            
            # Save scalers
            joblib.dump(self.scalers['features'], '../models/feature_scaler.pkl')
            print("✓ Feature scaler saved")
            
            print("\n" + "="*50)
            print("ALL MODELS SAVED SUCCESSFULLY!")
            print("="*50)
            
        except Exception as e:
            print(f"\nError saving models: {e}")
            print("Trying alternative save location...")
            
            # Try saving in current directory
            os.makedirs('models', exist_ok=True)
            
            self.models['crop_yield'].save('models/crop_yield_model.h5')
            
            for name, model in self.models.items():
                if name != 'crop_yield':
                    joblib.dump(model, f'models/{name}_model.pkl')
            
            joblib.dump(self.scalers['features'], 'models/feature_scaler.pkl')
            print("Models saved in current directory")
    
    def load_models(self):
        """Load trained models"""
        import os
        
        model_paths = [
            ('crop_yield', 'crop_yield_model.h5'),
            ('disease_risk', 'disease_risk_model.pkl'),
            ('water_needs', 'water_needs_model.pkl'),
            ('fertilizer_needs', 'fertilizer_needs_model.pkl'),
            ('pest_risk', 'pest_risk_model.pkl'),
            ('scaler', 'feature_scaler.pkl')
        ]
        
        print("Checking for trained models...")
        
        for name, filename in model_paths:
            path = f'../models/{filename}'
            if not os.path.exists(path):
                path = f'models/{filename}'
            
            if os.path.exists(path):
                print(f"✓ Found {filename}")
            else:
                print(f"✗ Missing {filename}")
                return False
        
        print("\nLoading trained models...")
        
        try:
            # Load NN model
            self.models['crop_yield'] = keras.models.load_model('../models/crop_yield_model.h5')
            
            # Load other models
            for name, filename in model_paths[1:-1]:  # Skip crop_yield and scaler
                self.models[name] = joblib.load(f'../models/{filename}')
            
            # Load scaler
            self.scalers['features'] = joblib.load('../models/feature_scaler.pkl')
            
            print("✓ All models loaded successfully!")
            return True
            
        except Exception as e:
            print(f"Error loading models: {e}")
            print("Trying current directory...")
            
            try:
                self.models['crop_yield'] = keras.models.load_model('models/crop_yield_model.h5')
                
                for name, filename in model_paths[1:-1]:
                    self.models[name] = joblib.load(f'models/{filename}')
                
                self.scalers['features'] = joblib.load('models/feature_scaler.pkl')
                print("✓ Models loaded from current directory!")
                return True
                
            except Exception as e2:
                print(f"Error loading models from current directory: {e2}")
                return False

if __name__ == "__main__":
    print("="*50)
    print("SMART FARMING AI MODEL TRAINER")
    print("="*50)
    
    trainer = FarmAIModel()
    
    # Check if models already exist
    if trainer.load_models():
        print("\nTrained models found! Would you like to:")
        print("1. Use existing models")
        print("2. Retrain new models")
        
        choice = input("\nEnter choice (1 or 2): ").strip()
        
        if choice == '1':
            print("\nUsing existing models...")
        else:
            print("\nStarting model training...")
            trainer.train_models()
    else:
        print("\nNo trained models found. Starting training...")
        trainer.train_models()
    
    print("\n" + "="*50)
    print("TRAINING COMPLETE!")
    print("="*50)
    
    # Test prediction with sample data
    print("\nTesting with sample data...")
    sample_data = np.array([[6.8, 2.5, 350, 25.5, 65, 450]])
    
    if trainer.scalers.get('features') is not None:
        sample_scaled = trainer.scalers['features'].transform(sample_data)
        
        print(f"\nSample Input: pH={sample_data[0,0]}, Temp={sample_data[0,3]}°C, Humidity={sample_data[0,4]}%")
        
        predictions = {}
        for name, model in trainer.models.items():
            if name == 'crop_yield':
                pred = model.predict(sample_scaled)[0][0]
            else:
                pred = model.predict(sample_scaled)[0]
            predictions[name] = pred
        
        print("\nPredicted Values:")
        for name, value in predictions.items():
            if name == 'crop_yield':
                print(f"  {name.replace('_', ' ').title():20}: {value*100:.1f}%")
            else:
                print(f"  {name.replace('_', ' ').title():20}: {value*100:.1f}%")