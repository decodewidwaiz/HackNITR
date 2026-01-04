// Enhanced Smart Farming AI Dashboard
class SmartFarmingDashboard {
    constructor() {
        this.apiBase = 'http://localhost:8000/api';
        this.currentData = {};
        this.predictions = {};
        this.charts = {};
        this.updateInterval = null;
        this.historicalData = [];
        
        this.initialize();
    }
    
    async initialize() {
        console.log('🚀 Initializing Enhanced Smart Farming AI Dashboard...');
        
        // Initialize all components
        await this.initializeCharts();
        this.setupEventListeners();
        this.updateTime();
        
        // Load initial data
        await this.loadAllData();
        
        // Start auto-refresh
        this.startAutoRefresh();
        
        console.log('✅ Dashboard initialized successfully');
    }
    
    async initializeCharts() {
        // Initialize all charts with enhanced configurations
        this.charts = {
            riskChart: this.createRiskChart(),
            yieldChart: this.createYieldChart(),
            sensorChart: this.createSensorChart(),
            trendChart: this.createTrendChart(),
            distributionChart: this.createDistributionChart(),
            healthChart: this.createHealthChart(),
            predictionsChart: this.createPredictionsChart()
        };
    }
    
    createRiskChart() {
        const ctx = document.getElementById('riskChart')?.getContext('2d');
        if (!ctx) return null;
        
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical'],
                datasets: [{
                    data: [40, 30, 20, 10],
                    backgroundColor: [
                        'rgba(22, 163, 74, 0.8)',
                        'rgba(217, 119, 6, 0.8)',
                        'rgba(220, 38, 38, 0.8)',
                        'rgba(185, 28, 28, 0.8)'
                    ],
                    borderColor: [
                        '#16a34a',
                        '#d97706',
                        '#dc2626',
                        '#b91c1c'
                    ],
                    borderWidth: 2,
                    hoverBorderWidth: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 11,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        titleFont: { size: 12, weight: '600' },
                        bodyFont: { size: 11 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => `${context.label}: ${context.parsed}%`
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }
    
    createYieldChart() {
        const ctx = document.getElementById('yieldChart')?.getContext('2d');
        if (!ctx) return null;
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                datasets: [{
                    label: 'Predicted Yield',
                    data: [65, 70, 72, 75, 78, 80, 82],
                    borderColor: '#1a7f37',
                    backgroundColor: 'rgba(26, 127, 55, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#1a7f37',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(30, 41, 59, 0.95)'
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => `${value}%`
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });
    }
    
    createSensorChart() {
        const ctx = document.getElementById('sensorChart')?.getContext('2d');
        if (!ctx) return null;
        
        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['pH Level', 'Temperature', 'Humidity', 'Soil Moisture', 'Air Quality', 'Nutrients'],
                datasets: [{
                    label: 'Current Values',
                    data: [75, 80, 65, 70, 85, 60],
                    backgroundColor: 'rgba(26, 127, 55, 0.2)',
                    borderColor: '#1a7f37',
                    pointBackgroundColor: '#1a7f37',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    borderWidth: 2
                }, {
                    label: 'Optimal Range',
                    data: [90, 85, 80, 85, 90, 85],
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    borderWidth: 1,
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            display: false
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            font: {
                                size: 11,
                                weight: '600'
                            },
                            color: '#374151'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }
    
    createTrendChart() {
        const ctx = document.getElementById('trendChart')?.getContext('2d');
        if (!ctx) return null;
        
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Crop Yield',
                    data: [65, 68, 72, 75, 78, 80, 82],
                    backgroundColor: 'rgba(26, 127, 55, 0.8)',
                    borderColor: '#1a7f37',
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false
                }, {
                    label: 'Disease Risk',
                    data: [35, 30, 28, 25, 22, 20, 18],
                    backgroundColor: 'rgba(220, 38, 38, 0.8)',
                    borderColor: '#dc2626',
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => `${value}%`
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    createDistributionChart() {
        const ctx = document.getElementById('distributionChart')?.getContext('2d');
        if (!ctx) return null;
        
        return new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['Optimal', 'Good', 'Fair', 'Poor', 'Critical'],
                datasets: [{
                    data: [40, 25, 15, 12, 8],
                    backgroundColor: [
                        'rgba(22, 163, 74, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(250, 204, 21, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(220, 38, 38, 0.8)'
                    ],
                    borderColor: [
                        '#16a34a',
                        '#22c55e',
                        '#facc15',
                        '#f59e0b',
                        '#dc2626'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        ticks: {
                            display: false
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        });
    }
    
    createHealthChart() {
        // For health monitoring
        return null;
    }
    
    createPredictionsChart() {
        // For future predictions
        return null;
    }
    
    async loadAllData() {
        try {
            await Promise.all([
                this.loadSensorData(),
                this.loadPredictions(),
                this.loadAlerts(),
                this.loadTrends(),
                this.loadHistoricalData()
            ]);
            
            this.updateAllDisplays();
            this.showToast('Data loaded successfully', 'success');
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Failed to load data. Check connection.', 'error');
        }
    }
    
    async loadSensorData() {
        try {
            console.log('📡 Loading sensor data from API...');
            const response = await fetch(`${this.apiBase}/data`);
            const data = await response.json();
            
            console.log('Raw sensor data received:', data);
            
            // Store the data directly - it should already be processed
            this.currentData = data;
            
            console.log('✅ Sensor data loaded and stored:', this.currentData);
            
        } catch (error) {
            console.error('Error loading sensor data:', error);
            // Use mock data for demo
            this.currentData = this.generateMockSensorData();
        }
    }
    
    async loadPredictions() {
        try {
            console.log('🔮 Loading predictions from API...');
            const response = await fetch(`${this.apiBase}/predictions`);
            this.predictions = await response.json();
            console.log('✅ Predictions loaded:', this.predictions);
        } catch (error) {
            console.error('Error loading predictions:', error);
            // Use mock predictions for demo
            this.predictions = this.generateMockPredictions();
        }
    }
    
    async loadAlerts() {
        try {
            const response = await fetch(`${this.apiBase}/alerts`);
            this.alerts = await response.json();
        } catch (error) {
            console.error('Error loading alerts:', error);
            this.alerts = this.generateMockAlerts();
        }
    }
    
    async loadTrends() {
        try {
            const response = await fetch(`${this.apiBase}/trends`);
            this.trends = await response.json();
        } catch (error) {
            console.error('Error loading trends:', error);
            this.trends = this.generateMockTrends();
        }
    }
    
    async loadHistoricalData() {
        try {
            const response = await fetch(`${this.apiBase}/historical?limit=50`);
            this.historicalData = await response.json();
        } catch (error) {
            console.error('Error loading historical data:', error);
            this.historicalData = this.generateMockHistoricalData();
        }
    }
    
    updateAllDisplays() {
        console.log('🔄 Updating all displays with data:', this.currentData);
        this.updateSensorDisplays();
        this.updatePredictionsDisplay();
        this.updateRiskAnalysis();
        this.updateAlertsDisplay();
        this.updateRecommendations();
        this.updateTrendsDisplay();
        this.updateHistoricalTable();
        this.updateCharts();
        this.updateQuickStats();
        this.updateTime();
    }
    
    updateSensorDisplays() {
        console.log('📊 Updating sensor displays with:', this.currentData);
        
        // Map sensor data to display elements
        const sensors = {
            'ph_value': { 
                element: 'ph_value', 
                format: v => {
                    if (v === undefined || v === null || v === '--') {
                        return '--';
                    }
                    const num = parseFloat(v);
                    return isNaN(num) ? '--' : num.toFixed(2);
                } 
            },
            'temperature': { 
                element: 'temperature', 
                format: v => {
                    if (v === undefined || v === null || v === '--') {
                        return '--';
                    }
                    const num = parseFloat(v);
                    return isNaN(num) ? '--' : `${num.toFixed(1)}°C`;
                } 
            },
            'humidity': { 
                element: 'humidity', 
                format: v => {
                    if (v === undefined || v === null || v === '--') {
                        return '--';
                    }
                    const num = parseFloat(v);
                    return isNaN(num) ? '--' : `${num.toFixed(1)}%`;
                } 
            },
            'soil_percent': { 
                element: 'soil_percent', 
                format: v => {
                    if (v === undefined || v === null || v === '--') {
                        return '--';
                    }
                    const num = parseFloat(v);
                    return isNaN(num) ? '--' : `${num.toFixed(1)}%`;
                } 
            },
            'mq137_raw': { 
                element: 'mq137', 
                format: v => {
                    if (v === undefined || v === null || v === '--') {
                        return '--';
                    }
                    const num = parseFloat(v);
                    return isNaN(num) ? '--' : Math.round(num);
                } 
            }
        };
        
        Object.entries(sensors).forEach(([key, config]) => {
            const element = document.getElementById(config.element);
            const value = this.currentData[key];
            
            console.log(`Updating ${key}: ${value}`);
            
            if (element) {
                const formattedValue = config.format(value);
                element.textContent = formattedValue;
                this.applySensorStyle(element, key, value);
            }
        });
        
        // Update status displays
        this.updateStatusDisplays();
    }
    
    applySensorStyle(element, key, value) {
        if (value === undefined || value === null || value === '--') {
            element.classList.remove('good', 'warning', 'danger');
            return;
        }
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            element.classList.remove('good', 'warning', 'danger');
            return;
        }
        
        element.classList.remove('good', 'warning', 'danger');
        
        switch(key) {
            case 'ph_value':
                if (numValue < 5.5 || numValue > 7.5) {
                    element.classList.add('danger');
                } else if (numValue < 6.0 || numValue > 7.0) {
                    element.classList.add('warning');
                } else {
                    element.classList.add('good');
                }
                break;
                
            case 'temperature':
                if (numValue > 35 || numValue < 10) {
                    element.classList.add('danger');
                } else if (numValue > 30 || numValue < 15) {
                    element.classList.add('warning');
                } else {
                    element.classList.add('good');
                }
                break;
                
            case 'humidity':
                if (numValue > 85 || numValue < 30) {
                    element.classList.add('danger');
                } else if (numValue > 75 || numValue < 40) {
                    element.classList.add('warning');
                } else {
                    element.classList.add('good');
                }
                break;
                
            case 'soil_percent':
                if (numValue > 80 || numValue < 30) {
                    element.classList.add('danger');
                } else if (numValue > 70 || numValue < 40) {
                    element.classList.add('warning');
                } else {
                    element.classList.add('good');
                }
                break;
                
            case 'mq137_raw':
                if (numValue > 500) {
                    element.classList.add('danger');
                } else if (numValue > 300) {
                    element.classList.add('warning');
                } else {
                    element.classList.add('good');
                }
                break;
        }
    }
    
    updateStatusDisplays() {
        // Add rain and flame status to sensor readings if they don't exist
        const readingsContainer = document.querySelector('.sensor-readings');
        if (readingsContainer) {
            // Check if rain status exists
            if (!document.getElementById('rain_status_display')) {
                const rainReading = document.createElement('div');
                rainReading.className = 'reading';
                rainReading.innerHTML = `
                    <span>Rain Status</span>
                    <span class="reading-value" id="rain_status_display">--</span>
                `;
                readingsContainer.appendChild(rainReading);
            }
            
            // Check if flame status exists
            if (!document.getElementById('flame_status_display')) {
                const flameReading = document.createElement('div');
                flameReading.className = 'reading';
                flameReading.innerHTML = `
                    <span>Flame Status</span>
                    <span class="reading-value" id="flame_status_display">--</span>
                `;
                readingsContainer.appendChild(flameReading);
            }
        }
        
        // Update rain status
        const rainElement = document.getElementById('rain_status_display');
        if (rainElement && this.currentData.rain_status) {
            rainElement.textContent = this.currentData.rain_status;
            rainElement.className = 'reading-value ' + 
                (this.currentData.rain_status === 'Rain Detected' ? 'danger' : 'good');
        }
        
        // Update flame status
        const flameElement = document.getElementById('flame_status_display');
        if (flameElement && this.currentData.flame_status) {
            flameElement.textContent = this.currentData.flame_status;
            flameElement.className = 'reading-value ' +
                (this.currentData.flame_status === 'Flame Detected' ? 'danger' : 'good');
        }
    }
    
    updatePredictionsDisplay() {
        const predictions = this.predictions.predictions || {};
        console.log('📈 Updating predictions with:', predictions);
        
        // Update prediction values
        const predictionElements = {
            'crop_yield': { 
                element: 'predicted_yield', 
                format: v => {
                    if (v === undefined || v === null) return '--%';
                    const num = parseFloat(v);
                    return isNaN(num) ? '--%' : `${(num * 100).toFixed(1)}%`;
                } 
            },
            'disease_risk': { 
                element: 'disease_risk', 
                format: v => {
                    if (v === undefined || v === null) return '--%';
                    const num = parseFloat(v);
                    return isNaN(num) ? '--%' : `${(num * 100).toFixed(1)}%`;
                } 
            },
            'pest_risk': { 
                element: 'pest_risk', 
                format: v => {
                    if (v === undefined || v === null) return '--%';
                    const num = parseFloat(v);
                    return isNaN(num) ? '--%' : `${(num * 100).toFixed(1)}%`;
                } 
            },
            'water_needs': { 
                element: 'water_needs', 
                format: v => {
                    if (v === undefined || v === null) return '--%';
                    const num = parseFloat(v);
                    return isNaN(num) ? '--%' : `${(num * 100).toFixed(1)}%`;
                } 
            },
            'fertilizer_needs': { 
                element: 'fertilizer_needs', 
                format: v => {
                    if (v === undefined || v === null) return '--%';
                    const num = parseFloat(v);
                    return isNaN(num) ? '--%' : `${(num * 100).toFixed(1)}%`;
                } 
            }
        };
        
        Object.entries(predictionElements).forEach(([key, config]) => {
            const element = document.getElementById(config.element);
            if (element) {
                const formattedValue = config.format(predictions[key]);
                element.textContent = formattedValue;
                this.applyPredictionStyle(element, predictions[key]);
            }
        });
        
        // Update risk bars
        this.updateRiskBars();
    }
    
    updateRiskBars() {
        const predictions = this.predictions.predictions || {};
        
        const riskBars = {
            'disease_risk': 'disease_risk_bar',
            'pest_risk': 'pest_risk_bar',
            'water_needs': 'water_needs_bar',
            'fertilizer_needs': 'fertilizer_needs_bar'
        };
        
        Object.entries(riskBars).forEach(([key, barId]) => {
            const bar = document.getElementById(barId);
            if (bar && predictions[key] !== undefined && predictions[key] !== null) {
                const value = parseFloat(predictions[key]);
                if (!isNaN(value)) {
                    const width = Math.min(value * 100, 100);
                    bar.style.width = `${width}%`;
                    
                    // Update bar color based on value
                    if (value > 0.7) {
                        bar.className = 'risk-fill critical';
                    } else if (value > 0.4) {
                        bar.className = 'risk-fill high';
                    } else if (value > 0.2) {
                        bar.className = 'risk-fill medium';
                    } else {
                        bar.className = 'risk-fill low';
                    }
                }
            }
        });
    }
    
    applyPredictionStyle(element, value) {
        element.classList.remove('good', 'warning', 'danger');
        
        if (value === undefined || value === null) return;
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;
        
        if (numValue > 0.7) {
            element.classList.add('danger');
        } else if (numValue > 0.4) {
            element.classList.add('warning');
        } else {
            element.classList.add('good');
        }
    }
    
    updateRiskAnalysis() {
        const riskAnalysis = this.predictions.risk_analysis || {};
        const riskScore = riskAnalysis.overall_risk_score || 25;
        const riskLevel = riskAnalysis.risk_level?.toLowerCase() || 'low';
        
        // Update risk score
        const riskScoreElement = document.getElementById('risk_score');
        const riskLabelElement = document.getElementById('risk_label');
        const riskFillElement = document.getElementById('risk_fill');
        
        if (riskScoreElement) riskScoreElement.textContent = Math.round(riskScore);
        if (riskLabelElement) {
            riskLabelElement.textContent = riskLevel.toUpperCase();
            riskLabelElement.className = `risk-label ${riskLevel}`;
        }
        if (riskFillElement) {
            riskFillElement.style.width = `${Math.min(riskScore, 100)}%`;
            riskFillElement.className = `risk-fill ${riskLevel}`;
        }
        
        // Update risk metrics
        this.updateRiskMetrics(riskAnalysis);
        
        // Update risk chart
        this.updateRiskChart(riskScore, riskLevel);
    }
    
    updateRiskMetrics(riskAnalysis) {
        const metricsContainer = document.getElementById('risk_metrics');
        if (!metricsContainer) return;
        
        const metrics = riskAnalysis.environmental_risks || {};
        const metricValues = {
            'Temperature Risk': metrics.temperature_risk || 0,
            'Humidity Risk': metrics.humidity_risk || 0,
            'Soil Risk': metrics.soil_moisture_risk || 0,
            'pH Risk': metrics.ph_risk || 0
        };
        
        metricsContainer.innerHTML = Object.entries(metricValues)
            .map(([label, value]) => `
                <div class="risk-metric">
                    <span class="risk-metric-label">${label}</span>
                    <div class="risk-metric-value">${Math.round(value)}%</div>
                </div>
            `).join('');
    }
    
    updateRiskChart(riskScore, riskLevel) {
        const chart = this.charts.riskChart;
        if (!chart) return;
        
        // Calculate distribution based on risk score
        let distribution;
        if (riskLevel === 'critical') {
            distribution = [10, 20, 30, 40];
        } else if (riskLevel === 'high') {
            distribution = [20, 30, 40, 10];
        } else if (riskLevel === 'medium') {
            distribution = [30, 40, 20, 10];
        } else {
            distribution = [40, 30, 20, 10];
        }
        
        chart.data.datasets[0].data = distribution;
        chart.update();
    }
    
    updateAlertsDisplay() {
        const alertsContainer = document.getElementById('alerts_list');
        const alertCount = document.getElementById('alert_count');
        
        if (!alertsContainer) return;
        
        const alerts = this.alerts || [];
        
        if (alertCount) {
            alertCount.textContent = alerts.length;
        }
        
        if (alerts.length === 0) {
            alertsContainer.innerHTML = `
                <div class="alert-item success">
                    <div class="alert-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="alert-content">
                        <h4>All Systems Normal</h4>
                        <p>No alerts at this time. All sensors are operating within optimal ranges.</p>
                        <div class="alert-time">${new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
            `;
            return;
        }
        
        alertsContainer.innerHTML = alerts.slice(0, 5).map(alert => `
            <div class="alert-item ${alert.severity || alert.type || 'info'}">
                <div class="alert-icon">
                    <i class="fas fa-${alert.severity === 'critical' || alert.type === 'critical' ? 'exclamation-triangle' : 
                                      alert.severity === 'high' || alert.type === 'warning' ? 'exclamation-circle' : 
                                      'info-circle'}"></i>
                </div>
                <div class="alert-content">
                    <h4>${alert.title || 'Alert'}</h4>
                    <p>${alert.message || 'No message provided'}</p>
                    <div class="alert-time">${new Date(alert.timestamp || Date.now()).toLocaleTimeString()}</div>
                </div>
            </div>
        `).join('');
    }
    
    updateRecommendations() {
        const recommendations = this.predictions.recommendations || {};
        
        // Update crop recommendations
        this.updateCropRecommendations(recommendations.crop_recommendations);
        
        // Update product recommendations
        this.updateProductRecommendations(recommendations.product_recommendations);
        
        // Update insights
        this.updateInsights(recommendations.insights);
    }
    
    updateCropRecommendations(crops) {
        const container = document.getElementById('crop_recommendations');
        if (!container) return;
        
        const cropList = crops || this.generateMockCropRecommendations();
        
        container.innerHTML = cropList.slice(0, 4).map(crop => `
            <div class="recommendation-card">
                <h4>${crop.crop_name || 'Unknown Crop'}</h4>
                <p>Suitability: ${crop.suitability_score || 0}% • ${crop.suitability_level || 'Moderate'}</p>
                <span class="recommendation-badge">${crop.season || 'All Season'}</span>
            </div>
        `).join('');
    }
    
    updateProductRecommendations(products) {
        const container = document.getElementById('product_recommendations');
        if (!container) return;
        
        const productList = products || this.generateMockProductRecommendations();
        
        let html = '';
        if (typeof productList === 'object' && !Array.isArray(productList)) {
            // Handle object structure
            Object.entries(productList).forEach(([category, items]) => {
                if (Array.isArray(items)) {
                    items.slice(0, 2).forEach(item => {
                        html += `
                            <div class="recommendation-card">
                                <h4>${item.name || 'Unknown Product'}</h4>
                                <p>${item.brand || ''} • ${item.dosage || item.coverage || ''}</p>
                                <span class="recommendation-badge">${category.replace('_', ' ')}</span>
                            </div>
                        `;
                    });
                }
            });
        } else if (Array.isArray(productList)) {
            // Handle array structure
            productList.slice(0, 4).forEach(item => {
                html += `
                    <div class="recommendation-card">
                        <h4>${item.name || 'Unknown Product'}</h4>
                        <p>${item.brand || ''} • ${item.dosage || item.coverage || ''}</p>
                        <span class="recommendation-badge">Product</span>
                    </div>
                `;
            });
        }
        
        container.innerHTML = html || `
            <div class="recommendation-card">
                <h4>No Special Products Needed</h4>
                <p>Current conditions are optimal. Maintain regular farming practices.</p>
                <span class="recommendation-badge">Optimal</span>
            </div>
        `;
    }
    
    updateInsights(insights) {
        const container = document.getElementById('insights_list');
        if (!container) return;
        
        const insightList = insights || this.generateMockInsights();
        
        container.innerHTML = insightList.slice(0, 5).map(insight => `
            <div class="insight-item">
                <div class="insight-icon">
                    <i class="fas fa-lightbulb"></i>
                </div>
                <div class="insight-content">
                    <h4>AI Insight</h4>
                    <p>${insight}</p>
                </div>
            </div>
        `).join('');
    }
    
    updateTrendsDisplay() {
        const trends = this.trends || {};
        
        // Update trend chart
        if (this.charts.trendChart && trends.sensor_stats) {
            const stats = trends.sensor_stats;
            const labels = Object.keys(stats).slice(0, 7);
            const values = labels.map(label => stats[label]?.average || 0);
            
            this.charts.trendChart.data.labels = labels.map(l => l.replace('_', ' '));
            this.charts.trendChart.data.datasets[0].data = values;
            this.charts.trendChart.update();
        }
        
        // Update quick stats
        this.updateQuickStats();
    }
    
    updateQuickStats() {
        const container = document.getElementById('quick_stats');
        if (!container) return;
        
        const stats = this.trends?.sensor_stats || {};
        const current = this.currentData || {};
        
        const quickStats = [
            { 
                label: 'Avg. Temperature', 
                value: stats.temperature?.average ? `${stats.temperature.average.toFixed(1)}°C` : 
                       (current.temperature ? `${parseFloat(current.temperature).toFixed(1)}°C` : '--°C'), 
                icon: 'thermometer-half' 
            },
            { 
                label: 'Avg. Humidity', 
                value: stats.humidity?.average ? `${stats.humidity.average.toFixed(1)}%` : 
                       (current.humidity ? `${parseFloat(current.humidity).toFixed(1)}%` : '--%'), 
                icon: 'tint' 
            },
            { 
                label: 'Avg. pH Level', 
                value: stats.ph_value?.average ? stats.ph_value.average.toFixed(2) : 
                       (current.ph_value ? parseFloat(current.ph_value).toFixed(2) : '--'), 
                icon: 'vial' 
            },
            { 
                label: 'Soil Moisture', 
                value: stats.soil_moisture_percent?.average ? `${stats.soil_moisture_percent.average.toFixed(1)}%` : 
                       (current.soil_percent ? `${parseFloat(current.soil_percent).toFixed(1)}%` : '--%'), 
                icon: 'leaf' 
            }
        ];
        
        container.innerHTML = quickStats.map(stat => `
            <div class="stat-item">
                <span class="stat-label">
                    <i class="fas fa-${stat.icon}"></i>
                    ${stat.label}
                </span>
                <span class="stat-value">${stat.value}</span>
            </div>
        `).join('');
    }
    
    updateHistoricalTable() {
        const tableBody = document.querySelector('#history_table tbody');
        if (!tableBody) return;
        
        const data = this.historicalData.slice(-10).reverse();
        
        tableBody.innerHTML = data.map(record => `
            <tr>
                <td>${record.timestamp ? new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</td>
                <td>${record.ph_value ? parseFloat(record.ph_value).toFixed(2) : '--'}</td>
                <td>${record.temperature ? parseFloat(record.temperature).toFixed(1) : '--'}</td>
                <td>${record.humidity ? parseFloat(record.humidity).toFixed(1) : '--'}</td>
                <td>${record.soil_percent ? parseFloat(record.soil_percent).toFixed(1) : '--'}</td>
                <td>${record.crop_yield ? (parseFloat(record.crop_yield) * 100).toFixed(1) + '%' : '--'}</td>
            </tr>
        `).join('');
    }
    
    updateCharts() {
        // Update yield chart with future predictions
        if (this.charts.yieldChart && this.predictions.future_predictions) {
            const future = this.predictions.future_predictions;
            const predictedYield = future.predicted_yield || [];
            this.charts.yieldChart.data.datasets[0].data = predictedYield.map(v => (parseFloat(v) || 0) * 100);
            this.charts.yieldChart.update();
        }
        
        // Update sensor chart with current data
        if (this.charts.sensorChart && this.currentData) {
            const phValue = parseFloat(this.currentData.ph_value) || 7;
            const tempValue = parseFloat(this.currentData.temperature) || 25;
            const humidityValue = parseFloat(this.currentData.humidity) || 60;
            const soilValue = parseFloat(this.currentData.soil_percent) || 50;
            const ammoniaValue = parseFloat(this.currentData.mq137_raw) || 300;
            
            const data = [
                Math.min(phValue * 10, 100),  // pH (scaled)
                Math.min(tempValue * 2, 100), // Temperature (scaled)
                Math.min(humidityValue, 100), // Humidity
                Math.min(soilValue, 100),     // Soil Moisture
                Math.min((1000 - ammoniaValue) / 10, 100), // Air Quality (inverted)
                75 // Nutrients (mock)
            ];
            
            this.charts.sensorChart.data.datasets[0].data = data;
            this.charts.sensorChart.update();
        }
    }
    
    updateTime() {
        const timeElement = document.getElementById('current_time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('en-US', { 
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
    
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh_btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('export_btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('auto_refresh');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        }
    }
    
    switchTab(tabId) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
        
        // Show corresponding content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}_content`);
        });
        
        // Update charts for analytics tab
        if (tabId === 'analytics' && this.charts.distributionChart) {
            this.charts.distributionChart.update();
        }
    }
    
    async refreshData() {
        const refreshBtn = document.getElementById('refresh_btn');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing';
        }
        
        try {
            await this.loadAllData();
            this.showToast('Data refreshed successfully', 'success');
        } catch (error) {
            this.showToast('Failed to refresh data', 'error');
        } finally {
            if (refreshBtn) {
                setTimeout(() => {
                    refreshBtn.disabled = false;
                    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                }, 1000);
            }
        }
    }
    
    startAutoRefresh() {
        this.stopAutoRefresh();
        this.updateInterval = setInterval(() => {
            this.loadSensorData();
            this.loadPredictions();
            this.loadAlerts();
            this.updateAllDisplays();
        }, 10000); // 10 seconds
    }
    
    stopAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            sensor_data: this.currentData,
            predictions: this.predictions,
            trends: this.trends,
            historical_data: this.historicalData
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smart-farming-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully', 'success');
    }
    
    showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast container if it doesn't exist
        let container = document.getElementById('toast_container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast_container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
            `;
            document.body.appendChild(container);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.cssText = `
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon" style="font-size: 20px;">
                <i class="fas fa-${icons[type] || 'info-circle'}"></i>
            </div>
            <div class="toast-content" style="flex: 1;">
                <div class="toast-title" style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message" style="font-size: 13px;">${message}</div>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    // Mock data generators for demo
    generateMockSensorData() {
        return {
            ph_value: 6.8,
            temperature: 25.5,
            humidity: 65.0,
            soil_percent: 55.0,
            mq137_raw: 350.0,
            rain_status: "No Rain",
            flame_status: "No Flame",
            timestamp: new Date().toISOString()
        };
    }
    
    generateMockPredictions() {
        return {
            predictions: {
                crop_yield: 0.75,
                disease_risk: 0.2,
                water_needs: 0.5,
                fertilizer_needs: 0.4,
                pest_risk: 0.3
            },
            risk_analysis: {
                overall_risk_score: 25,
                risk_level: "low",
                environmental_risks: {
                    temperature_risk: 20,
                    humidity_risk: 15,
                    soil_moisture_risk: 10,
                    ph_risk: 5
                }
            },
            recommendations: {
                crop_recommendations: [
                    {crop_name: "Wheat", suitability_score: 75, suitability_level: "High", season: "Rabi"},
                    {crop_name: "Rice", suitability_score: 65, suitability_level: "Moderate", season: "Kharif"}
                ],
                product_recommendations: {
                    fertilizers: [
                        {name: "NPK 20-20-20", brand: "AgroCare", dosage: "100-150 kg/acre"}
                    ]
                },
                insights: [
                    "Optimal conditions for maximum yield detected",
                    "Consider reducing irrigation frequency by 20%"
                ]
            },
            future_predictions: {
                predicted_yield: [0.75, 0.76, 0.77, 0.78, 0.79, 0.80, 0.81]
            }
        };
    }
    
    generateMockCropRecommendations() {
        const crops = ['Wheat', 'Rice', 'Corn', 'Soybean', 'Cotton', 'Potato', 'Tomato'];
        return crops.map(crop => ({
            crop_name: crop,
            suitability_score: 60 + Math.random() * 35,
            suitability_level: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
            season: ['Kharif', 'Rabi', 'All'][Math.floor(Math.random() * 3)]
        })).sort((a, b) => b.suitability_score - a.suitability_score);
    }
    
    generateMockProductRecommendations() {
        return {
            fertilizers: [
                { name: 'NPK 20-20-20', brand: 'AgroCare', dosage: '100-150 kg/acre' },
                { name: 'Urea', brand: 'IFFCO', dosage: '50-100 kg/acre' }
            ],
            pesticides: [
                { name: 'Neem Oil', brand: 'BioSafe', dosage: '2-5 ml/liter' }
            ]
        };
    }
    
    generateMockInsights() {
        return [
            'Optimal conditions for maximum yield detected',
            'Consider reducing irrigation frequency by 20%',
            'Soil pH is ideal for most crops',
            'Monitor temperature closely during afternoon hours',
            'Implement integrated pest management strategy'
        ];
    }
    
    generateMockAlerts() {
        return [];
    }
    
    generateMockTrends() {
        return {
            sensor_stats: {
                temperature: { average: 26.5, min: 22, max: 30, trend: 'stable' },
                humidity: { average: 65, min: 55, max: 75, trend: 'decreasing' },
                ph_value: { average: 6.8, min: 6.5, max: 7.0, trend: 'stable' },
                soil_moisture_percent: { average: 62, min: 55, max: 70, trend: 'increasing' }
            }
        };
    }
    
    generateMockHistoricalData() {
        return Array.from({length: 20}, (_, i) => ({
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            ph_value: 6.8 + (i * 0.01),
            temperature: 25.5 + (i * 0.1),
            humidity: 65.0 - (i * 0.5),
            soil_percent: 55.0 + (i * 0.2),
            crop_yield: 0.75 + (i * 0.01)
        }));
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Loading Smart Farming AI Dashboard...');
    window.dashboard = new SmartFarmingDashboard();
});