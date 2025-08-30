# Test API endpoints
$baseUrl = "http://localhost:8000/api"

# Function to test an endpoint
function Test-Endpoint {
    param (
        [string]$url,
        [string]$method = "GET",
        [object]$body = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $params = @{
        Uri = $url
        Method = $method
        Headers = $headers
    }
    
    if ($body) {
        $params.Body = $body | ConvertTo-Json
    }
    
    try {
        $response = Invoke-RestMethod @params -ErrorAction Stop
        return @{
            Success = $true
            Data = $response
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
            Response = try { $_.ErrorDetails.Message | ConvertFrom-Json } catch { $_.ErrorDetails.Message }
        }
    }
}

# Test API root
Write-Host "Testing API root..." -ForegroundColor Cyan
$result = Test-Endpoint -url "$baseUrl/"
if ($result.Success) {
    Write-Host "✅ API root is accessible" -ForegroundColor Green
    $result.Data | ConvertTo-Json -Depth 5 | Out-Host
} else {
    Write-Host "❌ API root is not accessible" -ForegroundColor Red
    Write-Host "Status Code: $($result.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($result.Error)" -ForegroundColor Red
}

# Test auth endpoints
$authEndpoints = @(
    @{ Path = "/auth/register/"; Method = "POST"; Body = @{
        email = "test_$(Get-Date -Format "yyyyMMddHHmmss")@example.com"
        password1 = "TestPass123!"
        password2 = "TestPass123!"
        first_name = "Test"
        last_name = "User"
    }},
    @{ Path = "/auth/login/"; Method = "POST"; Body = @{
        email = "admin@example.com"  # Update with a valid test user
        password = "adminpass"       # Update with the correct password
    }},
    @{ Path = "/auth/me/"; Method = "GET" }
)

foreach ($endpoint in $authEndpoints) {
    $url = "$baseUrl$($endpoint.Path)"
    Write-Host "`nTesting $($endpoint.Method) $url" -ForegroundColor Cyan
    
    $result = Test-Endpoint -url $url -method $endpoint.Method -body $endpoint.Body
    
    if ($result.Success) {
        Write-Host "✅ Success" -ForegroundColor Green
        $result.Data | ConvertTo-Json -Depth 5 | Out-Host
    } else {
        Write-Host "❌ Failed" -ForegroundColor Red
        Write-Host "Status Code: $($result.StatusCode)" -ForegroundColor Red
        Write-Host "Error: $($result.Error)" -ForegroundColor Red
        if ($result.Response) {
            Write-Host "Response: " -NoNewline
            $result.Response | ConvertTo-Json -Depth 5 | Out-Host
        }
    }
}
