# SmartFarm API - Frontend Integration Guide

This guide provides comprehensive information for frontend developers to integrate seamlessly with the SmartFarm API.

## 🚀 Quick Start

### Base URL
```
Development: http://localhost:8000/api/
Production: https://your-domain.com/api/
```

### Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

## 📋 Standardized API Response Format

All API endpoints return responses in a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "error": {
    "code": 400,
    "message": "Detailed error message",
    "details": {
      "field_name": ["Field-specific error message"]
    }
  }
}
```

## 🔐 Authentication Flow

### 1. User Registration
```javascript
const registerUser = async (userData) => {
  try {
    const response = await fetch('/api/auth/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password2: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role // 'farmer', 'agronomist', 'supplier', 'extension_officer'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Store tokens
      localStorage.setItem('accessToken', result.data.tokens.access);
      localStorage.setItem('refreshToken', result.data.tokens.refresh);
      return result.data.user;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};
```

### 2. User Login
```javascript
const loginUser = async (credentials) => {
  try {
    const response = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      localStorage.setItem('accessToken', result.data.tokens.access);
      localStorage.setItem('refreshToken', result.data.tokens.refresh);
      return result.data.user;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### 3. Token Refresh
```javascript
const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem('refreshToken');
    const response = await fetch('/api/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh })
    });
    
    const result = await response.json();
    
    if (result.success) {
      localStorage.setItem('accessToken', result.access);
      return result.access;
    } else {
      // Redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Redirect to login
    window.location.href = '/login';
  }
};
```

## 📊 Data Endpoints

### 1. Crop Recommendations
```javascript
const getCropRecommendations = async (filters) => {
  try {
    const params = new URLSearchParams({
      region: filters.region,
      ...(filters.season && { season: filters.season }),
      ...(filters.soilType && { soil_type: filters.soilType })
    });
    
    const response = await fetch(`/api/recommendations/?${params}`);
    const result = await response.json();
    
    if (result.success) {
      return {
        recommendations: result.data.results,
        totalCount: result.data.count,
        filtersApplied: result.data.filters_applied
      };
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    throw error;
  }
};
```

### 2. Yield Forecasting
```javascript
const getYieldForecast = async (forecastData) => {
  try {
    const params = new URLSearchParams({
      crop: forecastData.crop,
      region: forecastData.region,
      season: forecastData.season,
      hectares: forecastData.hectares
    });
    
    const response = await fetch(`/api/yield/forecast/?${params}`);
    const result = await response.json();
    
    if (result.success) {
      return {
        forecast: result.data.forecast_yield,
        factors: result.data.factors,
        confidence: result.data.confidence,
        crop: result.data.crop,
        region: result.data.region
      };
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Yield forecast failed:', error);
    throw error;
  }
};
```

### 3. Market Prices
```javascript
const getMarketPrices = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.cropName) params.append('crop_name', filters.cropName);
    if (filters.region) params.append('region', filters.region);
    if (filters.dateAfter) params.append('date_after', filters.dateAfter);
    if (filters.dateBefore) params.append('date_before', filters.dateBefore);
    
    const response = await fetch(`/api/prices/?${params}`);
    const result = await response.json();
    
    if (result.success) {
      return {
        prices: result.data.results,
        count: result.data.count,
        pagination: {
          next: result.data.next,
          previous: result.data.previous
        }
      };
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to get market prices:', error);
    throw error;
  }
};
```

### 4. Price Analytics
```javascript
const getPriceAnalytics = async (crop, region) => {
  try {
    const params = new URLSearchParams({
      crop_name: crop,
      region: region
    });
    
    const response = await fetch(`/api/prices/analytics/?${params}`);
    const result = await response.json();
    
    if (result.success) {
      return {
        analytics: result.data.analytics,
        trend: result.data.recent_trend,
        crop: result.data.crop,
        region: result.data.region
      };
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to get price analytics:', error);
    throw error;
  }
};
```

## 🔄 Loading States and Error Handling

### Loading State Management
```javascript
class APIClient {
  constructor() {
    this.isLoading = false;
    this.loadingCallbacks = [];
  }
  
  setLoading(loading) {
    this.isLoading = loading;
    this.loadingCallbacks.forEach(callback => callback(loading));
  }
  
  onLoadingChange(callback) {
    this.loadingCallbacks.push(callback);
  }
  
  async request(url, options = {}) {
    this.setLoading(true);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new APIError(result.message, result.error);
      }
      
      return result.data;
    } catch (error) {
      if (error.status === 401) {
        await this.handleTokenRefresh();
        return this.request(url, options); // Retry
      }
      throw error;
    } finally {
      this.setLoading(false);
    }
  }
  
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}
```

### Error Handling
```javascript
class APIError extends Error {
  constructor(message, errorDetails) {
    super(message);
    this.name = 'APIError';
    this.details = errorDetails;
  }
}

const handleAPIError = (error) => {
  if (error instanceof APIError) {
    // Handle validation errors
    if (error.details && error.details.details) {
      return {
        type: 'validation',
        message: error.message,
        fieldErrors: error.details.details
      };
    }
    
    // Handle other API errors
    return {
      type: 'api',
      message: error.message,
      code: error.details?.code
    };
  }
  
  // Handle network errors
  return {
    type: 'network',
    message: 'Network error. Please check your connection.'
  };
};
```

## 📱 React Integration Example

### Custom Hook for API Calls
```javascript
import { useState, useEffect } from 'react';

const useAPI = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          ...options
        });
        
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [url]);
  
  return { data, loading, error };
};

// Usage in component
const CropRecommendations = ({ region }) => {
  const { data, loading, error } = useAPI(`/api/recommendations/?region=${region}`);
  
  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Crop Recommendations for {region}</h2>
      {data?.results?.map(crop => (
        <div key={crop.id}>
          <h3>{crop.name}</h3>
          <p>Suitability: {crop.suitability}</p>
          <p>Score: {crop.score}</p>
        </div>
      ))}
    </div>
  );
};
```

## 🔍 API Status and Health Monitoring

### Health Check
```javascript
const checkAPIHealth = async () => {
  try {
    const response = await fetch('/api/health/');
    const result = await response.json();
    
    return {
      healthy: result.success && result.data.status === 'ok',
      details: result.data
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
};
```

### API Status Information
```javascript
const getAPIStatus = async () => {
  try {
    const response = await fetch('/api/status/');
    const result = await response.json();
    
    if (result.success) {
      return {
        info: result.data.api_info,
        endpoints: result.data.endpoints,
        statistics: result.data.statistics,
        configuration: result.data.configuration
      };
    }
  } catch (error) {
    console.error('Failed to get API status:', error);
  }
};
```

## 🎯 Best Practices

### 1. Token Management
- Store tokens securely (consider using httpOnly cookies for production)
- Implement automatic token refresh
- Handle token expiration gracefully

### 2. Error Handling
- Always check the `success` field in responses
- Display user-friendly error messages
- Log detailed errors for debugging

### 3. Loading States
- Show loading indicators for better UX
- Disable form submissions during API calls
- Provide feedback for long-running operations

### 4. Caching
- Cache frequently accessed data (crops, regions)
- Implement cache invalidation strategies
- Use browser caching for static data

### 5. Performance
- Implement pagination for large datasets
- Use debouncing for search inputs
- Minimize API calls with efficient data fetching

## 📚 Available Endpoints Summary

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/health/` | GET | Health check | No |
| `/api/status/` | GET | API status and info | No |
| `/api/auth/register/` | POST | User registration | No |
| `/api/auth/login/` | POST | User login | No |
| `/api/auth/me/` | GET, PATCH | User profile | Yes |
| `/api/recommendations/` | GET | Crop recommendations | No |
| `/api/yield/forecast/` | GET | Yield forecasting | No |
| `/api/prices/` | GET | Market prices | No |
| `/api/prices/analytics/` | GET | Price analytics | No |
| `/api/support/` | GET, POST | Support tickets | Yes |

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized**: Token expired or invalid
   - Solution: Refresh token or redirect to login

2. **CORS Errors**: Cross-origin request blocked
   - Solution: Ensure API is configured for your domain

3. **Network Errors**: API unreachable
   - Solution: Check API health endpoint and network connectivity

4. **Validation Errors**: Invalid data submitted
   - Solution: Check error details and validate input on frontend

### Debug Mode
Enable debug logging by setting localStorage:
```javascript
localStorage.setItem('debug', 'true');
```

This comprehensive guide should help frontend developers integrate seamlessly with the SmartFarm API. For additional support, refer to the interactive API documentation at `/api/docs/`.