# SmartFarm ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    USER ||--o{ FARMER_PROFILE : has
    USER ||--o{ CROP : owns
    USER ||--o{ HELP_REQUEST : creates
    CROP ||--o{ YIELD_FORECAST : has
    CROP ||--o{ MARKET_PRICE : has
    SUPPLIER ||--o{ CROP : supplies

    USER {
        int id PK
        string username
        string email
        string password
        datetime created_at
        datetime updated_at
        boolean is_active
    }

    FARMER_PROFILE {
        int id PK
        int user_id FK
        string full_name
        string phone_number
        string address
        string farm_size
        string location_coordinates
        datetime created_at
        datetime updated_at
    }

    CROP {
        int id PK
        int farmer_id FK
        int supplier_id FK
        string name
        string variety
        float planted_area
        date planting_date
        date expected_harvest_date
        string status
        datetime created_at
        datetime updated_at
    }

    SUPPLIER {
        int id PK
        string name
        string contact_person
        string phone_number
        string email
        string address
        datetime created_at
        datetime updated_at
    }

    MARKET_PRICE {
        int id PK
        int crop_id FK
        float price_per_unit
        string unit
        date price_date
        string market_name
        datetime created_at
        datetime updated_at
    }

    YIELD_FORECAST {
        int id PK
        int crop_id FK
        float predicted_yield
        float confidence_score
        date forecast_date
        date target_date
        string forecast_model
        datetime created_at
        datetime updated_at
    }

    HELP_REQUEST {
        int id PK
        int user_id FK
        string title
        text description
        string status
        string category
        datetime created_at
        datetime updated_at
        datetime resolved_at
    }
```

## Relationships

1. **User to FarmerProfile (1:1)**: Each user has exactly one farmer profile.
2. **User to Crop (1:many)**: A user (farmer) can own multiple crops.
3. **User to HelpRequest (1:many)**: A user can create multiple help requests.
4. **Crop to YieldForecast (1:many)**: Each crop can have multiple yield forecasts over time.
5. **Crop to MarketPrice (1:many)**: Each crop can have multiple price records over time.
6. **Supplier to Crop (1:many)**: A supplier can provide multiple crops.

## Notes

- All tables include `created_at` and `updated_at` timestamps for auditing.
- Foreign keys are denoted with `FK`.
- Primary keys are denoted with `PK`.
- String lengths and other constraints would be defined in the model definitions.
