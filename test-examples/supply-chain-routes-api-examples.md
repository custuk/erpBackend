# Supply Chain Routes API - Test Examples

This document provides comprehensive examples for testing all Supply Chain Routes API endpoints.

## Base URL
```
http://localhost:3000
```

## 1. Create a Supply Chain Route

### Basic Route Creation
```bash
curl -X POST http://localhost:3000/api/supply-chain-routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Route",
    "description": "Test supply chain route",
    "routeType": "Supply Chain Route",
    "id": "ROUTE_1756929652812",
    "locations": [
      {
        "id": "SP01",
        "type": "supplier",
        "x": 150,
        "y": 200,
        "name": "Main Supplier",
        "description": "Primary raw material supplier",
        "attributes": {}
      },
      {
        "id": "CU01",
        "type": "customer",
        "x": 400,
        "y": 200,
        "name": "End Customer",
        "description": "Final product customer",
        "attributes": {}
      }
    ],
    "connectors": [
      {
        "id": "conn_1756929354146",
        "from": "SP01",
        "to": "CU01",
        "parentId": "SP01",
        "childId": "CU01",
        "transportMode": "road",
        "distance": 100,
        "duration": 2,
        "cost": 50,
        "attributes": {}
      }
    ],
    "hierarchicalStructure": {
      "routeName": "Test Route",
      "routeDescription": "Test supply chain route",
      "rootNodes": [],
      "allLocations": {},
      "allConnections": [],
      "generatedAt": "2025-09-03T20:00:52.812Z"
    }
  }'
```

### Complex Route with Multiple Locations
```bash
curl -X POST http://localhost:3000/api/supply-chain-routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Complex Manufacturing Route",
    "description": "Multi-stage manufacturing supply chain",
    "routeType": "Production Route",
    "id": "ROUTE_COMPLEX_001",
    "locations": [
      {
        "id": "SUPPLIER_A",
        "type": "supplier",
        "x": 100,
        "y": 100,
        "name": "Raw Material Supplier A",
        "description": "Steel supplier",
        "attributes": {
          "capacity": "1000 tons/month",
          "certification": "ISO 9001"
        }
      },
      {
        "id": "MANUFACTURER_1",
        "type": "manufacturer",
        "x": 300,
        "y": 100,
        "name": "Primary Manufacturer",
        "description": "Component manufacturing",
        "attributes": {
          "productionLine": "Line A",
          "shift": "24/7"
        }
      },
      {
        "id": "QA_CENTER",
        "type": "qa",
        "x": 500,
        "y": 100,
        "name": "Quality Assurance",
        "description": "Quality control center",
        "attributes": {
          "standards": "ISO 14001"
        }
      },
      {
        "id": "WAREHOUSE_1",
        "type": "warehouse",
        "x": 700,
        "y": 100,
        "name": "Distribution Warehouse",
        "description": "Storage and distribution",
        "attributes": {
          "capacity": "5000 sqm"
        }
      },
      {
        "id": "CUSTOMER_1",
        "type": "customer",
        "x": 900,
        "y": 100,
        "name": "End Customer",
        "description": "Final destination",
        "attributes": {
          "orderFrequency": "weekly"
        }
      }
    ],
    "connectors": [
      {
        "id": "conn_supplier_manufacturer",
        "from": "SUPPLIER_A",
        "to": "MANUFACTURER_1",
        "parentId": "SUPPLIER_A",
        "childId": "MANUFACTURER_1",
        "transportMode": "road",
        "distance": 200,
        "duration": 4,
        "cost": 150,
        "attributes": {
          "truckType": "Heavy Duty",
          "driver": "John Doe"
        }
      },
      {
        "id": "conn_manufacturer_qa",
        "from": "MANUFACTURER_1",
        "to": "QA_CENTER",
        "parentId": "MANUFACTURER_1",
        "childId": "QA_CENTER",
        "transportMode": "conveyor",
        "distance": 200,
        "duration": 1,
        "cost": 25,
        "attributes": {
          "conveyorSpeed": "2 m/s"
        }
      },
      {
        "id": "conn_qa_warehouse",
        "from": "QA_CENTER",
        "to": "WAREHOUSE_1",
        "parentId": "QA_CENTER",
        "childId": "WAREHOUSE_1",
        "transportMode": "road",
        "distance": 200,
        "duration": 2,
        "cost": 75,
        "attributes": {
          "truckType": "Standard"
        }
      },
      {
        "id": "conn_warehouse_customer",
        "from": "WAREHOUSE_1",
        "to": "CUSTOMER_1",
        "parentId": "WAREHOUSE_1",
        "childId": "CUSTOMER_1",
        "transportMode": "road",
        "distance": 200,
        "duration": 3,
        "cost": 100,
        "attributes": {
          "deliveryWindow": "9AM-5PM"
        }
      }
    ],
    "hierarchicalStructure": {
      "routeName": "Complex Manufacturing Route",
      "routeDescription": "Multi-stage manufacturing supply chain",
      "rootNodes": [],
      "allLocations": {},
      "allConnections": [],
      "generatedAt": "2025-01-15T10:00:00.000Z"
    },
    "tags": ["manufacturing", "quality-controlled", "high-volume"],
    "status": "active"
  }'
```

## 2. Get All Supply Chain Routes

### Basic List
```bash
curl -X GET http://localhost:3000/api/supply-chain-routes
```

### With Pagination
```bash
curl -X GET "http://localhost:3000/api/supply-chain-routes?page=1&limit=5"
```

### Filter by Status
```bash
curl -X GET "http://localhost:3000/api/supply-chain-routes?status=active"
```

### Filter by Route Type
```bash
curl -X GET "http://localhost:3000/api/supply-chain-routes?routeType=Supply Chain Route"
```

### Filter by Location Type
```bash
curl -X GET "http://localhost:3000/api/supply-chain-routes?locationType=supplier"
```

### Search by Name or Description
```bash
curl -X GET "http://localhost:3000/api/supply-chain-routes?search=manufacturing"
```

### Sort by Creation Date
```bash
curl -X GET "http://localhost:3000/api/supply-chain-routes?sortBy=createdAt&sortOrder=desc"
```

## 3. Get Single Supply Chain Route

### By MongoDB ID
```bash
curl -X GET http://localhost:3000/api/supply-chain-routes/64f8a1b2c3d4e5f6a7b8c9d0
```

### By Custom Route ID
```bash
curl -X GET http://localhost:3000/api/supply-chain-routes/by-route-id/ROUTE_1756929652812
```

## 4. Update Supply Chain Route

### Update Basic Information
```bash
curl -X PUT http://localhost:3000/api/supply-chain-routes/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Route Name",
    "description": "Updated description",
    "tags": ["updated", "modified"]
  }'
```

### Update Status
```bash
curl -X PATCH http://localhost:3000/api/supply-chain-routes/64f8a1b2c3d4e5f6a7b8c9d0/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

## 5. Search Routes Between Two Locations

### Basic Search
```bash
curl -X GET "http://localhost:3000/api/supply-chain-routes/search/between-locations?fromLocation=SP01&toLocation=CU01"
```

### Search with Best Match Sorting
```bash
curl -X GET "http://localhost:3000/api/supply-chain-routes/search/between-locations?fromLocation=SUPPLIER_A&toLocation=CUSTOMER_1&sortBy=bestMatch"
```

### Search with Shortest Route Sorting
```bash
curl -X GET "http://localhost:3000/api/supply-chain-routes/search/between-locations?fromLocation=SUPPLIER_A&toLocation=CUSTOMER_1&sortBy=shortest"
```

### Search with Most Direct Route Sorting
```bash
curl -X GET "http://localhost:3000/api/supply-chain-routes/search/between-locations?fromLocation=SUPPLIER_A&toLocation=CUSTOMER_1&sortBy=mostDirect"
```

## 6. Search Routes by Location

### Get All Routes Containing a Specific Location
```bash
curl -X GET http://localhost:3000/api/supply-chain-routes/search/by-location/SP01
```

### Include Inactive Routes
```bash
curl -X GET "http://localhost:3000/api/supply-chain-routes/search/by-location/SP01?includeInactive=true"
```

## 7. Get Statistics

### Overview Statistics
```bash
curl -X GET http://localhost:3000/api/supply-chain-routes/stats/overview
```

## 8. Get Metadata

### Get All Location Types
```bash
curl -X GET http://localhost:3000/api/supply-chain-routes/meta/location-types
```

### Get All Route Types
```bash
curl -X GET http://localhost:3000/api/supply-chain-routes/meta/route-types
```

### Get All Tags
```bash
curl -X GET http://localhost:3000/api/supply-chain-routes/meta/tags
```

## 9. Delete Supply Chain Route

```bash
curl -X DELETE http://localhost:3000/api/supply-chain-routes/64f8a1b2c3d4e5f6a7b8c9d0
```

## 10. Advanced Search Examples

### Search with Multiple Filters
```bash
curl -X GET "http://localhost:3000/api/supply-chain-routes?status=active&routeType=Supply Chain Route&locationType=supplier&tags=manufacturing&sortBy=createdAt&sortOrder=desc&page=1&limit=10"
```

### Search with Date Range
```bash
curl -X GET "http://localhost:3000/api/supply-chain-routes?startDate=2025-01-01&endDate=2025-12-31"
```

## Expected Response Formats

### Successful Response
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Test Route",
    "description": "Test supply chain route",
    "routeType": "Supply Chain Route",
    "id": "ROUTE_1756929652812",
    "locations": [...],
    "connectors": [...],
    "hierarchicalStructure": {...},
    "status": "draft",
    "totalLocations": 2,
    "totalConnectors": 1,
    "complexity": "simple",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### List Response with Pagination
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## Testing Tips

1. **Start with creating a simple route** using the first example
2. **Test the search functionality** by creating multiple routes with different locations
3. **Use the statistics endpoint** to verify your data
4. **Test error handling** by sending invalid data
5. **Use the metadata endpoints** to understand available options

## Common Use Cases

1. **Route Planning**: Create routes for different supply chain scenarios
2. **Location Analysis**: Find all routes that use a specific location
3. **Optimization**: Search for the best routes between two points
4. **Monitoring**: Track route status and performance
5. **Reporting**: Use statistics for business intelligence


