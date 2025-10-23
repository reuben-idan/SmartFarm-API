// SmartFarm Frontend Application
class SmartFarmApp {
    constructor() {
        this.API_BASE = 'http://127.0.0.1:8000/api'; // Local Django development server
        this.currentUser = null;
        this.isAuthMode = 'login';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAPIStatus();
        this.loadInitialData();
        this.setupNavigation();
    }

    setupEventListeners() {
        // Auth buttons
        document.getElementById('loginBtn').addEventListener('click', () => this.openAuthModal('login'));
        document.getElementById('signupBtn').addEventListener('click', () => this.openAuthModal('signup'));
        
        // Auth form
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuth(e));
        
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Auto-load prices on page load
        setTimeout(() => this.getPrices(), 1000);
    }

    setupNavigation() {
        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    handleNavigation(e) {
        e.preventDefault();
        const target = e.target.getAttribute('href');
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.target.classList.add('active');
        
        // Scroll to section
        if (target.startsWith('#')) {
            const section = document.querySelector(target);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.API_BASE}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.currentUser?.token && { 'Authorization': `Bearer ${this.currentUser.token}` })
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API call failed:', error);
            return { success: false, message: error.message };
        }
    }

    showLoader(elementId) {
        const loader = document.getElementById(elementId);
        if (loader) {
            loader.classList.add('active');
        }
    }

    hideLoader(elementId) {
        const loader = document.getElementById(elementId);
        if (loader) {
            loader.classList.remove('active');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    padding: 1rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    z-index: 3000;
                    animation: slideIn 0.3s ease;
                    max-width: 300px;
                }
                .notification.success { border-left: 4px solid var(--success-color); }
                .notification.error { border-left: 4px solid var(--error-color); }
                .notification.warning { border-left: 4px solid var(--warning-color); }
                .notification-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                }
                .notification button {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    opacity: 0.7;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    async checkAPIStatus() {
        const statusElement = document.getElementById('apiStatus');
        const indicator = document.getElementById('statusIndicator');
        
        try {
            const result = await this.apiCall('/status/');
            
            if (result.success) {
                statusElement.textContent = 'System Online';
                indicator.style.background = '#34c759';
                this.loadStats();
            } else {
                statusElement.textContent = 'System Offline';
                indicator.style.background = '#ff3b30';
            }
        } catch (error) {
            statusElement.textContent = 'Connection Error';
            indicator.style.background = '#ff3b30';
        }
    }

    async loadStats() {
        try {
            const result = await this.apiCall('/status/');
            if (result.success && result.data.statistics) {
                const stats = result.data.statistics;
                document.getElementById('totalCrops').textContent = stats.total_crops || '0';
                document.getElementById('totalRegions').textContent = stats.active_regions?.length || '0';
            }
            
            // Also load crops count directly
            const cropsResult = await this.apiCall('/crops/');
            if (cropsResult.success) {
                document.getElementById('totalCrops').textContent = cropsResult.data.count || '0';
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    async loadInitialData() {
        // Load some initial data for better UX
        setTimeout(() => this.checkAPIStatus(), 500);
        setTimeout(() => this.loadCropsData(), 1000);
    }

    async loadCropsData() {
        try {
            const result = await this.apiCall('/crops/');
            if (result.success) {
                this.cropsData = result.data.results;
                this.populateCropDropdowns();
            }
        } catch (error) {
            console.error('Failed to load crops data:', error);
        }
    }

    populateCropDropdowns() {
        const cropInput = document.getElementById('crop');
        if (this.cropsData && this.cropsData.length > 0) {
            // Create datalist for crop input
            let datalist = document.getElementById('crop-datalist');
            if (!datalist) {
                datalist = document.createElement('datalist');
                datalist.id = 'crop-datalist';
                cropInput.setAttribute('list', 'crop-datalist');
                cropInput.parentNode.appendChild(datalist);
            }
            
            datalist.innerHTML = this.cropsData.map(crop => 
                `<option value="${crop.name.toLowerCase()}">${crop.name}</option>`
            ).join('');
        }
    }

    async getRecommendations() {
        const region = document.getElementById('region').value;
        const season = document.getElementById('season-filter').value;
        const soilType = document.getElementById('soilType').value;
        const farmSize = document.getElementById('farmSize').value;
        const experience = document.getElementById('experience').value;
        const budget = document.getElementById('budget').value;
        const resultsContainer = document.getElementById('recommendations-results');
        
        if (!region) {
            this.showNotification('Please select a region first', 'warning');
            return;
        }
        
        this.showLoader('recLoader');
        resultsContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Analyzing your requirements and generating smart recommendations...</p></div>';
        
        try {
            let endpoint = `/recommendations/?region=${region}`;
            if (season) endpoint += `&season=${season}`;
            if (soilType) endpoint += `&soil_type=${soilType}`;
            
            const result = await this.apiCall(endpoint);
            
            if (result.success && result.data.results) {
                // Apply additional filtering based on form inputs
                let filteredResults = this.applyAdvancedFilters(result.data.results, {
                    farmSize, experience, budget
                });
                
                this.displayRecommendations(filteredResults);
                this.updateRecommendationSummary(filteredResults.length);
                this.createRecommendationChart(filteredResults);
                this.showNotification(`Found ${filteredResults.length} personalized recommendations!`, 'success');
            } else {
                resultsContainer.innerHTML = `<div class="error-state">No recommendations found for the selected criteria</div>`;
                this.showNotification(result.message || 'No matching recommendations found', 'warning');
            }
        } catch (error) {
            resultsContainer.innerHTML = '<div class="error-state">Failed to load recommendations</div>';
            this.showNotification('Network error occurred', 'error');
        } finally {
            this.hideLoader('recLoader');
        }
    }
    
    applyAdvancedFilters(recommendations, filters) {
        return recommendations.map(rec => {
            let adjustedScore = rec.score;
            
            // Adjust score based on farm size
            if (filters.farmSize === 'small' && rec.maturity_days < 90) adjustedScore += 0.2;
            if (filters.farmSize === 'large' && rec.maturity_days > 120) adjustedScore += 0.1;
            
            // Adjust for experience level
            if (filters.experience === 'beginner' && rec.name.toLowerCase().includes('maize')) adjustedScore += 0.3;
            if (filters.experience === 'expert' && rec.recommended_inputs) adjustedScore += 0.1;
            
            return { ...rec, score: Math.min(adjustedScore, 5.0) };
        }).sort((a, b) => b.score - a.score);
    }
    
    updateRecommendationSummary(count) {
        const summary = document.getElementById('recSummary');
        const countSpan = document.getElementById('recCount');
        if (summary && countSpan) {
            countSpan.textContent = count;
            summary.style.display = count > 0 ? 'block' : 'none';
        }
    }
    
    clearRecommendationFilters() {
        document.getElementById('region').value = '';
        document.getElementById('season-filter').value = '';
        document.getElementById('soilType').value = '';
        document.getElementById('farmSize').value = '';
        document.getElementById('experience').value = '';
        document.getElementById('budget').value = '';
        document.getElementById('recommendations-results').innerHTML = '';
        document.getElementById('recSummary').style.display = 'none';
        this.showNotification('Filters cleared', 'success');
    }

    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendations-results');
        
        if (!recommendations.length) {
            container.innerHTML = '<div class="error-state">No recommendations available for the selected criteria</div>';
            return;
        }
        
        const html = recommendations.map((crop, index) => `
            <div class="recommendation-item" style="animation-delay: ${index * 0.1}s">
                <div class="recommendation-header">
                    <div class="crop-info">
                        <div class="crop-name">${crop.name}</div>
                        <div class="crop-rank">#${index + 1} Recommendation</div>
                    </div>
                    <div class="score-badge">Score: ${crop.score}</div>
                </div>
                <div class="recommendation-details">
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Season:</span>
                            <span class="detail-value">${crop.season.charAt(0).toUpperCase() + crop.season.slice(1)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Soil Type:</span>
                            <span class="detail-value">${crop.soil_type || 'Any'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Maturity:</span>
                            <span class="detail-value">${crop.maturity_days} days</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Regions:</span>
                            <span class="detail-value">${crop.regions.join(', ')}</span>
                        </div>
                    </div>
                    ${crop.suitability ? `<span class="suitability ${crop.suitability}">${crop.suitability.replace('_', ' ').toUpperCase()}</span>` : ''}
                    ${crop.recommended_inputs ? `
                        <div class="inputs-section">
                            <h5>Recommended Inputs:</h5>
                            <div class="inputs-list">
                                ${Object.entries(crop.recommended_inputs).map(([key, value]) => 
                                    `<span class="input-tag">${key}: ${value}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
        
        // Add enhanced styles for recommendations
        this.addRecommendationStyles();
    }
    
    addRecommendationStyles() {
        if (!document.querySelector('#recommendation-styles')) {
            const styles = document.createElement('style');
            styles.id = 'recommendation-styles';
            styles.textContent = `
                .recommendation-item {
                    opacity: 0;
                    transform: translateY(20px);
                    animation: slideInUp 0.5s ease forwards;
                }
                @keyframes slideInUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .crop-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .crop-rank {
                    font-size: 0.8rem;
                    color: var(--primary-color);
                    font-weight: 500;
                }
                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 0.75rem;
                    margin: 1rem 0;
                }
                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .detail-label {
                    font-size: 0.8rem;
                    opacity: 0.8;
                    font-weight: 500;
                }
                .detail-value {
                    font-weight: 600;
                }
                .inputs-section {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                .inputs-section h5 {
                    margin-bottom: 0.5rem;
                    color: var(--primary-color);
                }
                .inputs-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .input-tag {
                    background: rgba(0, 122, 255, 0.2);
                    color: var(--primary-color);
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    async getForecast() {
        const crop = document.getElementById('crop').value;
        const region = document.getElementById('forecastRegion').value;
        const season = document.getElementById('season').value;
        const hectares = document.getElementById('hectares').value;
        const farmingMethod = document.getElementById('farmingMethod').value;
        const irrigation = document.getElementById('irrigation').value;
        const resultsContainer = document.getElementById('forecast-results');
        
        if (!crop || !hectares || !region || !season) {
            this.showNotification('Please fill in all required fields marked with *', 'warning');
            return;
        }
        
        if (hectares <= 0 || hectares > 1000) {
            this.showNotification('Please enter a valid farm size (0.1 - 1000 hectares)', 'warning');
            return;
        }
        
        this.showLoader('forecastLoader');
        resultsContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Analyzing weather patterns, soil conditions, and generating advanced yield forecast...</p></div>';
        
        try {
            const endpoint = `/yield/forecast/?crop=${crop}&region=${region}&season=${season}&hectares=${hectares}`;
            const result = await this.apiCall(endpoint);
            
            if (result.success) {
                // Enhance forecast with additional factors
                const enhancedForecast = this.enhanceForecast(result.data, {
                    farmingMethod, irrigation, crop, region
                });
                this.displayEnhancedForecast(enhancedForecast);
                this.createForecastChart(enhancedForecast);
                this.showNotification('Advanced forecast generated successfully!', 'success');
            } else {
                resultsContainer.innerHTML = `<div class="error-state">${result.message}</div>`;
                this.showNotification(result.message || 'Failed to generate forecast', 'error');
            }
        } catch (error) {
            resultsContainer.innerHTML = '<div class="error-state">Failed to generate forecast</div>';
            this.showNotification('Network error occurred', 'error');
        } finally {
            this.hideLoader('forecastLoader');
        }
    }
    
    enhanceForecast(baseForecast, additionalFactors) {
        let adjustmentFactor = 1.0;
        
        // Farming method adjustments
        const methodMultipliers = {
            'traditional': 0.8,
            'improved': 1.0,
            'mechanized': 1.2,
            'organic': 0.9
        };
        
        // Irrigation adjustments
        const irrigationMultipliers = {
            'none': 0.85,
            'partial': 1.0,
            'full': 1.15
        };
        
        adjustmentFactor *= methodMultipliers[additionalFactors.farmingMethod] || 1.0;
        adjustmentFactor *= irrigationMultipliers[additionalFactors.irrigation] || 1.0;
        
        const adjustedYield = (parseFloat(baseForecast.forecast_yield) * adjustmentFactor).toFixed(2);
        
        return {
            ...baseForecast,
            forecast_yield: adjustedYield,
            original_yield: baseForecast.forecast_yield,
            adjustment_factor: adjustmentFactor.toFixed(3),
            farming_method: additionalFactors.farmingMethod,
            irrigation: additionalFactors.irrigation,
            risk_level: this.calculateRiskLevel(additionalFactors),
            recommendations: this.generateForecastRecommendations(additionalFactors)
        };
    }
    
    calculateRiskLevel(factors) {
        let riskScore = 0;
        if (factors.irrigation === 'none') riskScore += 2;
        if (factors.farmingMethod === 'traditional') riskScore += 1;
        
        if (riskScore >= 3) return 'High';
        if (riskScore >= 1) return 'Medium';
        return 'Low';
    }
    
    generateForecastRecommendations(factors) {
        const recommendations = [];
        if (factors.irrigation === 'none') {
            recommendations.push('Consider installing irrigation system for better yields');
        }
        if (factors.farmingMethod === 'traditional') {
            recommendations.push('Upgrade to improved farming techniques for higher productivity');
        }
        return recommendations;
    }
    
    clearForecastForm() {
        document.getElementById('crop').value = '';
        document.getElementById('forecastRegion').value = '';
        document.getElementById('season').value = '';
        document.getElementById('hectares').value = '';
        document.getElementById('farmingMethod').value = 'traditional';
        document.getElementById('irrigation').value = 'none';
        document.getElementById('forecast-results').innerHTML = '';
        this.showNotification('Form cleared', 'success');
    }

    displayEnhancedForecast(forecast) {
        const container = document.getElementById('forecast-results');
        
        const yieldPerHectare = (parseFloat(forecast.forecast_yield) / parseFloat(forecast.hectares)).toFixed(2);
        const potentialRevenue = (parseFloat(forecast.forecast_yield) * 800).toFixed(2); // Assuming GHS 800 per ton
        
        const html = `
            <div class="forecast-result enhanced">
                <div class="forecast-header">
                    <h4>Advanced Yield Forecast</h4>
                    <div class="forecast-confidence ${forecast.risk_level?.toLowerCase()}">
                        Risk Level: ${forecast.risk_level || 'Medium'}
                    </div>
                </div>
                
                <div class="forecast-summary">
                    <div class="summary-item primary">
                        <div class="summary-value">${forecast.forecast_yield} tons</div>
                        <div class="summary-label">Total Expected Yield</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${yieldPerHectare} t/ha</div>
                        <div class="summary-label">Yield per Hectare</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">GHS ${potentialRevenue}</div>
                        <div class="summary-label">Potential Revenue</div>
                    </div>
                </div>
                
                <div class="forecast-details">
                    <div class="detail-section">
                        <h5>Farm Details</h5>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Crop:</span>
                                <span class="detail-value">${forecast.crop}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Region:</span>
                                <span class="detail-value">${this.getRegionDisplayName(forecast.region)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Season:</span>
                                <span class="detail-value">${forecast.season}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Farm Size:</span>
                                <span class="detail-value">${forecast.hectares} hectares</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Farming Method:</span>
                                <span class="detail-value">${forecast.farming_method || 'Traditional'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Irrigation:</span>
                                <span class="detail-value">${forecast.irrigation || 'Rain-fed'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Calculation Breakdown</h5>
                        <div class="calculation-steps">
                            <div class="calc-step">
                                <span class="calc-label">Base Yield:</span>
                                <span class="calc-value">${forecast.factors?.base_yield_t_per_ha || 'N/A'} t/ha</span>
                            </div>
                            <div class="calc-step">
                                <span class="calc-label">Regional Factor:</span>
                                <span class="calc-value">${forecast.factors?.regional_multiplier || 'N/A'}</span>
                            </div>
                            <div class="calc-step">
                                <span class="calc-label">Season Factor:</span>
                                <span class="calc-value">${forecast.factors?.season_factor || 'N/A'}</span>
                            </div>
                            ${forecast.adjustment_factor ? `
                                <div class="calc-step">
                                    <span class="calc-label">Method Adjustment:</span>
                                    <span class="calc-value">${forecast.adjustment_factor}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${forecast.recommendations && forecast.recommendations.length > 0 ? `
                        <div class="detail-section">
                            <h5>Recommendations</h5>
                            <div class="recommendations-list">
                                ${forecast.recommendations.map(rec => `
                                    <div class="recommendation-item">
                                        <span class="rec-icon">💡</span>
                                        <span class="rec-text">${rec}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        this.addEnhancedForecastStyles();
    }
    
    addEnhancedForecastStyles() {
        if (!document.querySelector('#enhanced-forecast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'enhanced-forecast-styles';
            styles.textContent = `
                .forecast-result.enhanced {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .forecast-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .forecast-confidence {
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                .forecast-confidence.low { background: var(--success-color); color: white; }
                .forecast-confidence.medium { background: var(--warning-color); color: white; }
                .forecast-confidence.high { background: var(--error-color); color: white; }
                .forecast-summary {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .summary-item {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 1.5rem;
                    border-radius: 12px;
                    text-align: center;
                }
                .summary-item.primary {
                    background: var(--primary-color);
                    color: white;
                }
                .summary-value {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                .summary-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }
                .detail-section {
                    margin-bottom: 2rem;
                }
                .detail-section h5 {
                    color: var(--primary-color);
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                }
                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                }
                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                }
                .detail-label {
                    font-weight: 500;
                    opacity: 0.8;
                }
                .detail-value {
                    font-weight: 600;
                }
                .calculation-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .calc-step {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                }
                .recommendations-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .recommendation-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: rgba(0, 122, 255, 0.1);
                    border-radius: 8px;
                    border-left: 3px solid var(--primary-color);
                }
                .rec-icon {
                    font-size: 1.2rem;
                }
                .rec-text {
                    flex: 1;
                    line-height: 1.4;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    async getPrices(region = '') {
        const resultsContainer = document.getElementById('prices-results');
        resultsContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading comprehensive market data from Ghana...</p></div>';
        
        try {
            let endpoint = '/prices/';
            if (region) {
                endpoint += `?region=${region}`;
            }
            
            const result = await this.apiCall(endpoint);
            
            if (result.success && result.data.results) {
                this.allPrices = result.data.results;
                this.displayPrices(result.data.results);
                this.createPriceChart(result.data.results);
                this.showNotification(`Loaded ${result.data.results.length} market prices from Ghana!`, 'success');
            } else {
                resultsContainer.innerHTML = '<div class="error-state">No market price data available for Ghana</div>';
            }
        } catch (error) {
            resultsContainer.innerHTML = '<div class="error-state">Failed to load Ghana market prices</div>';
            this.showNotification('Failed to load market prices', 'error');
        }
    }
    
    filterPrices() {
        const region = document.getElementById('priceRegionFilter').value;
        if (this.allPrices) {
            const filteredPrices = region ? 
                this.allPrices.filter(price => price.region.toLowerCase() === region.toLowerCase()) : 
                this.allPrices;
            this.displayPrices(filteredPrices);
        } else {
            this.getPrices(region);
        }
    }

    displayPrices(prices) {
        const container = document.getElementById('prices-results');
        
        if (!prices.length) {
            container.innerHTML = '<div class="error-state">No price data available for the selected criteria</div>';
            this.updatePriceStats([]);
            return;
        }
        
        // Update statistics
        this.updatePriceStats(prices);
        
        // Apply current filters and sorting
        const filteredPrices = this.applyPriceFilters(prices);
        
        // Group prices by crop for better display
        const groupedPrices = filteredPrices.reduce((acc, price) => {
            const cropName = price.crop?.name || 'Unknown Crop';
            if (!acc[cropName]) {
                acc[cropName] = [];
            }
            acc[cropName].push(price);
            return acc;
        }, {});
        
        const html = Object.entries(groupedPrices).map(([cropName, cropPrices]) => {
            const avgPrice = cropPrices.reduce((sum, p) => sum + parseFloat(p.price), 0) / cropPrices.length;
            const maxPrice = Math.max(...cropPrices.map(p => parseFloat(p.price)));
            const minPrice = Math.min(...cropPrices.map(p => parseFloat(p.price)));
            const regions = [...new Set(cropPrices.map(p => p.region))];
            const priceVariation = ((maxPrice - minPrice) / avgPrice * 100).toFixed(1);
            
            return `
                <div class="price-group">
                    <div class="price-group-header">
                        <div class="crop-info">
                            <h4 class="crop-name">${cropName}</h4>
                            <div class="crop-category">${this.getCropCategory(cropName)}</div>
                            <div class="price-summary">
                                <span class="avg-price">Avg: GHS ${avgPrice.toFixed(2)}</span>
                                <span class="price-range">Range: GHS ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}</span>
                                <span class="region-count">${regions.length} region${regions.length > 1 ? 's' : ''}</span>
                                <span class="price-variation">Variation: ${priceVariation}%</span>
                            </div>
                        </div>
                        <div class="price-trend">
                            <span class="trend-indicator ${this.getPriceTrend(avgPrice)}">
                                ${this.getPriceTrendIcon(avgPrice)}
                            </span>
                        </div>
                    </div>
                    <div class="price-list">
                        ${cropPrices.map(price => `
                            <div class="price-item" data-price="${price.price}">
                                <div class="price-location">
                                    <span class="price-region">${this.getRegionDisplayName(price.region)}</span>
                                    <span class="price-date">${new Date(price.date).toLocaleDateString('en-GB')}</span>
                                    <span class="market-type">Wholesale</span>
                                </div>
                                <div class="price-details">
                                    <div class="price-value">GHS ${parseFloat(price.price).toFixed(2)}</div>
                                    <div class="price-unit">per bag (50kg)</div>
                                    <div class="price-status ${this.getPriceStatus(parseFloat(price.price), avgPrice)}">
                                        ${this.getPriceStatusText(parseFloat(price.price), avgPrice)}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
        this.updatePriceSummary(filteredPrices.length);
        this.addPriceStyles();
    }
    
    updatePriceStats(prices) {
        const statsContainer = document.getElementById('priceStats');
        if (!prices.length) {
            statsContainer.style.display = 'none';
            return;
        }
        
        const priceValues = prices.map(p => parseFloat(p.price));
        const avgPrice = priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length;
        const maxPrice = Math.max(...priceValues);
        const minPrice = Math.min(...priceValues);
        const variation = ((maxPrice - minPrice) / avgPrice * 100);
        
        document.getElementById('avgPrice').textContent = `GHS ${avgPrice.toFixed(2)}`;
        document.getElementById('highestPrice').textContent = `GHS ${maxPrice.toFixed(2)}`;
        document.getElementById('lowestPrice').textContent = `GHS ${minPrice.toFixed(2)}`;
        document.getElementById('priceVariation').textContent = `${variation.toFixed(1)}%`;
        
        statsContainer.style.display = 'block';
    }
    
    updatePriceSummary(count) {
        const summary = document.getElementById('priceSummary');
        const countSpan = document.getElementById('priceCount');
        if (summary && countSpan) {
            countSpan.textContent = count;
            summary.style.display = count > 0 ? 'block' : 'none';
        }
    }
    
    getCropCategory(cropName) {
        const categories = {
            'Maize': 'Cereals', 'Rice': 'Cereals', 'Millet': 'Cereals', 'Sorghum': 'Cereals',
            'Cowpea': 'Legumes', 'Groundnut': 'Legumes', 'Soybean': 'Legumes', 'Bambara Groundnut': 'Legumes',
            'Cassava': 'Root Crops', 'Yam': 'Root Crops', 'Sweet Potato': 'Root Crops', 'Cocoyam': 'Root Crops', 'Plantain': 'Root Crops',
            'Tomato': 'Vegetables', 'Onion': 'Vegetables', 'Pepper': 'Vegetables', 'Okra': 'Vegetables', 'Garden Egg': 'Vegetables', 'Cabbage': 'Vegetables', 'Carrot': 'Vegetables',
            'Cocoa': 'Cash Crops', 'Oil Palm': 'Cash Crops', 'Cotton': 'Cash Crops', 'Cashew': 'Cash Crops', 'Shea': 'Cash Crops',
            'Mango': 'Fruits', 'Orange': 'Fruits', 'Pineapple': 'Fruits', 'Banana': 'Fruits'
        };
        return categories[cropName] || 'Other';
    }
    
    createRecommendationChart(recommendations) {
        ChartManager.createRecommendationChart(recommendations);
    }
    
    createForecastChart(forecast) {
        ChartManager.createForecastChart(forecast);
    }
    
    createPriceChart(prices) {
        ChartManager.createPriceChart(prices);
    }
    
    getRegionDisplayName(region) {
        const displayNames = {
            'accra': 'Greater Accra',
            'kumasi': 'Ashanti',
            'tamale': 'Northern',
            'cape coast': 'Central',
            'ho': 'Volta',
            'sunyani': 'Brong Ahafo',
            'koforidua': 'Eastern',
            'wa': 'Upper West',
            'bolgatanga': 'Upper East',
            'takoradi': 'Western'
        };
        return displayNames[region.toLowerCase()] || region;
    }
    
    getPriceTrend(price) {
        // Mock trend calculation - in real app, compare with historical data
        return price > 100 ? 'up' : price < 50 ? 'down' : 'stable';
    }
    
    getPriceTrendIcon(price) {
        const trend = this.getPriceTrend(price);
        return trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '➡️';
    }
    
    getPriceStatus(price, avgPrice) {
        if (price > avgPrice * 1.1) return 'high';
        if (price < avgPrice * 0.9) return 'low';
        return 'average';
    }
    
    getPriceStatusText(price, avgPrice) {
        const status = this.getPriceStatus(price, avgPrice);
        return status === 'high' ? 'Above Average' : status === 'low' ? 'Below Average' : 'Average';
    }
    
    applyPriceFilters(prices) {
        const cropFilter = document.getElementById('priceCropFilter')?.value || '';
        const regionFilter = document.getElementById('priceRegionFilter')?.value || '';
        const rangeFilter = document.getElementById('priceRangeFilter')?.value || '';
        const sortFilter = document.getElementById('priceSortFilter')?.value || 'crop';
        
        let filtered = prices;
        
        // Apply filters
        if (cropFilter) {
            filtered = filtered.filter(price => {
                const category = this.getCropCategory(price.crop?.name || '');
                return category.toLowerCase().includes(cropFilter);
            });
        }
        
        if (regionFilter) {
            filtered = filtered.filter(price => price.region.toLowerCase() === regionFilter);
        }
        
        if (rangeFilter) {
            filtered = filtered.filter(price => {
                const p = parseFloat(price.price);
                if (rangeFilter === 'low') return p < 50;
                if (rangeFilter === 'medium') return p >= 50 && p <= 150;
                if (rangeFilter === 'high') return p > 150;
                return true;
            });
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortFilter) {
                case 'price_asc': return parseFloat(a.price) - parseFloat(b.price);
                case 'price_desc': return parseFloat(b.price) - parseFloat(a.price);
                case 'region': return a.region.localeCompare(b.region);
                case 'date': return new Date(b.date) - new Date(a.date);
                default: return (a.crop?.name || '').localeCompare(b.crop?.name || '');
            }
        });
        
        return filtered;
    }
    
    clearPriceFilters() {
        document.getElementById('priceCropFilter').value = '';
        document.getElementById('priceRegionFilter').value = '';
        document.getElementById('priceRangeFilter').value = '';
        document.getElementById('priceSortFilter').value = 'crop';
        this.getPrices();
        this.showNotification('Price filters cleared', 'success');
    }
    
    exportPrices() {
        if (!this.allPrices || !this.allPrices.length) {
            this.showNotification('No price data to export', 'warning');
            return;
        }
        
        const csvContent = this.convertPricesToCSV(this.allPrices);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ghana_market_prices_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.showNotification('Price data exported successfully!', 'success');
    }
    
    convertPricesToCSV(prices) {
        const headers = ['Crop', 'Region', 'Price (GHS)', 'Date', 'Category'];
        const rows = prices.map(price => [
            price.crop?.name || 'Unknown',
            this.getRegionDisplayName(price.region),
            parseFloat(price.price).toFixed(2),
            new Date(price.date).toLocaleDateString('en-GB'),
            this.getCropCategory(price.crop?.name || '')
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    addPriceStyles() {
        if (!document.querySelector('#price-styles')) {
            const styles = document.createElement('style');
            styles.id = 'price-styles';
            styles.textContent = `
                .price-group {
                    margin-bottom: 2rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .price-group-header {
                    margin-bottom: 1rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .crop-info h4 {
                    color: white;
                    margin-bottom: 0.5rem;
                    font-size: 1.25rem;
                }
                .price-summary {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }
                .avg-price {
                    background: var(--success-color);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                .region-count {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.9rem;
                }
                .price-list {
                    display: grid;
                    gap: 0.75rem;
                }
                .price-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    transition: var(--transition);
                }
                .price-item:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateX(4px);
                }
                .price-location {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .price-region {
                    background: var(--primary-color);
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    width: fit-content;
                }
                .price-date {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.6);
                }
                .price-value {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--success-color);
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Auth Methods
    openAuthModal(mode) {
        this.isAuthMode = mode;
        const modal = document.getElementById('authModal');
        const title = document.getElementById('authTitle');
        const btnText = document.getElementById('authBtnText');
        const switchText = document.getElementById('authSwitchText');
        const signupFields = document.getElementById('signupFields');
        
        if (mode === 'signup') {
            title.textContent = 'Sign Up';
            btnText.textContent = 'Sign Up';
            switchText.innerHTML = 'Already have an account? <a href="#" onclick="app.toggleAuthMode()">Login</a>';
            signupFields.classList.add('active');
        } else {
            title.textContent = 'Login';
            btnText.textContent = 'Login';
            switchText.innerHTML = 'Don\'t have an account? <a href="#" onclick="app.toggleAuthMode()">Sign up</a>';
            signupFields.classList.remove('active');
        }
        
        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('authModal').classList.remove('active');
    }

    toggleAuthMode() {
        this.openAuthModal(this.isAuthMode === 'login' ? 'signup' : 'login');
    }

    async handleAuth(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        this.showLoader('authLoader');
        
        try {
            if (this.isAuthMode === 'signup') {
                await this.signup({
                    username,
                    password,
                    password2: password,
                    email: document.getElementById('email').value,
                    first_name: document.getElementById('firstName').value,
                    last_name: document.getElementById('lastName').value,
                    role: document.getElementById('role').value
                });
            } else {
                await this.login({ username, password });
            }
        } finally {
            this.hideLoader('authLoader');
        }
    }

    async login(credentials) {
        try {
            const result = await this.apiCall('/auth/login/', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
            
            if (result.success) {
                this.currentUser = {
                    ...result.data.user,
                    token: result.data.tokens.access
                };
                this.closeModal();
                this.showNotification(`Welcome back, ${this.currentUser.first_name}!`, 'success');
                this.updateUIForLoggedInUser();
            } else {
                this.showNotification(result.message || 'Login failed', 'error');
            }
        } catch (error) {
            this.showNotification('Network error during login', 'error');
        }
    }

    async signup(userData) {
        try {
            const result = await this.apiCall('/auth/register/', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            if (result.success) {
                this.currentUser = {
                    ...result.data.user,
                    token: result.data.tokens.access
                };
                this.closeModal();
                this.showNotification(`Welcome to SmartFarm, ${this.currentUser.first_name}!`, 'success');
                this.updateUIForLoggedInUser();
            } else {
                this.showNotification(result.message || 'Signup failed', 'error');
            }
        } catch (error) {
            this.showNotification('Network error during signup', 'error');
        }
    }

    updateUIForLoggedInUser() {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        
        loginBtn.textContent = this.currentUser.first_name;
        loginBtn.onclick = () => this.showUserMenu();
        signupBtn.style.display = 'none';
    }

    showUserMenu() {
        // Simple user menu implementation
        const menu = confirm('Logged in as ' + this.currentUser.username + '\n\nClick OK to logout');
        if (menu) {
            this.logout();
        }
    }

    logout() {
        this.currentUser = null;
        document.getElementById('loginBtn').textContent = 'Login';
        document.getElementById('loginBtn').onclick = () => this.openAuthModal('login');
        document.getElementById('signupBtn').style.display = 'inline-flex';
        this.showNotification('Logged out successfully', 'success');
    }
}

// Global functions for HTML onclick handlers
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function checkAPIStatus() {
    app.checkAPIStatus();
}

function getRecommendations() {
    app.getRecommendations();
}

function getForecast() {
    app.getForecast();
}

function getPrices() {
    app.getPrices();
}

function filterPrices() {
    app.filterPrices();
}

function clearRecommendationFilters() {
    app.clearRecommendationFilters();
}

function clearForecastForm() {
    app.clearForecastForm();
}

function clearPriceFilters() {
    app.clearPriceFilters();
}

function exportPrices() {
    app.exportPrices();
}

function closeModal() {
    app.closeModal();
}

function toggleAuthMode() {
    app.toggleAuthMode();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SmartFarmApp();
});

// Update Ghana regions data
const GHANA_REGIONS_DATA = {
    'accra': { name: 'Greater Accra', climate: 'Coastal', rainfall: 'Low-Medium' },
    'kumasi': { name: 'Ashanti', climate: 'Forest', rainfall: 'High' },
    'tamale': { name: 'Northern', climate: 'Savanna', rainfall: 'Medium' },
    'cape coast': { name: 'Central', climate: 'Coastal', rainfall: 'Medium' },
    'ho': { name: 'Volta', climate: 'Forest-Savanna', rainfall: 'Medium-High' },
    'sunyani': { name: 'Brong Ahafo', climate: 'Forest-Savanna', rainfall: 'High' },
    'koforidua': { name: 'Eastern', climate: 'Forest', rainfall: 'High' },
    'wa': { name: 'Upper West', climate: 'Savanna', rainfall: 'Low' },
    'bolgatanga': { name: 'Upper East', climate: 'Savanna', rainfall: 'Low' },
    'takoradi': { name: 'Western', climate: 'Forest-Coastal', rainfall: 'High' }
};

// Ghana crop categories
const GHANA_CROP_CATEGORIES = {
    cereals: ['Maize', 'Rice', 'Millet', 'Sorghum'],
    legumes: ['Cowpea', 'Groundnut', 'Soybean', 'Bambara Groundnut'],
    roots: ['Cassava', 'Yam', 'Sweet Potato', 'Cocoyam', 'Plantain'],
    vegetables: ['Tomato', 'Onion', 'Pepper', 'Okra', 'Garden Egg', 'Cabbage', 'Carrot'],
    cash: ['Cocoa', 'Oil Palm', 'Cotton', 'Cashew', 'Shea Nut'],
    fruits: ['Mango', 'Orange', 'Pineapple', 'Banana']
};

// Chart creation methods
class ChartManager {
    static createRecommendationChart(recommendations) {
        const ctx = document.getElementById('recChart');
        if (!ctx || !recommendations.length) return;
        
        const chartContainer = document.getElementById('recommendations-chart');
        chartContainer.style.display = 'block';
        
        const data = recommendations.slice(0, 5).map(rec => ({
            crop: rec.name,
            score: rec.score
        }));
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.crop),
                datasets: [{
                    label: 'Suitability Score',
                    data: data.map(d => d.score),
                    backgroundColor: 'rgba(0, 122, 255, 0.8)',
                    borderColor: 'rgba(0, 122, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top Crop Recommendations',
                        color: 'white'
                    },
                    legend: {
                        labels: { color: 'white' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }
    
    static createForecastChart(forecast) {
        const ctx = document.getElementById('forecastChart');
        if (!ctx) return;
        
        const chartContainer = document.getElementById('forecast-chart');
        chartContainer.style.display = 'block';
        
        const yieldPerHa = (parseFloat(forecast.forecast_yield) / parseFloat(forecast.hectares)).toFixed(2);
        const avgYield = 2.5; // Ghana average
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Your Forecast', 'Ghana Average', 'Potential Gap'],
                datasets: [{
                    data: [yieldPerHa, avgYield, Math.max(0, 5 - yieldPerHa)],
                    backgroundColor: [
                        'rgba(52, 199, 89, 0.8)',
                        'rgba(255, 149, 0, 0.8)',
                        'rgba(255, 59, 48, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Yield Comparison (tons/ha)',
                        color: 'white'
                    },
                    legend: {
                        labels: { color: 'white' }
                    }
                }
            }
        });
    }
    
    static createPriceChart(prices) {
        const ctx = document.getElementById('pricesChart');
        if (!ctx || !prices.length) return;
        
        const chartContainer = document.getElementById('prices-chart');
        chartContainer.style.display = 'block';
        
        // Group by crop and get average prices
        const cropPrices = {};
        prices.forEach(price => {
            const crop = price.crop?.name || 'Unknown';
            if (!cropPrices[crop]) cropPrices[crop] = [];
            cropPrices[crop].push(parseFloat(price.price));
        });
        
        const chartData = Object.entries(cropPrices)
            .map(([crop, priceList]) => ({
                crop,
                avgPrice: priceList.reduce((sum, p) => sum + p, 0) / priceList.length
            }))
            .sort((a, b) => b.avgPrice - a.avgPrice)
            .slice(0, 8);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.map(d => d.crop),
                datasets: [{
                    label: 'Average Price (GHS)',
                    data: chartData.map(d => d.avgPrice),
                    borderColor: 'rgba(52, 199, 89, 1)',
                    backgroundColor: 'rgba(52, 199, 89, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Market Price Trends (GHS)',
                        color: 'white'
                    },
                    legend: {
                        labels: { color: 'white' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }
}