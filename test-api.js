const axios = require('axios');

// Test function to call the Supply Chain Routes API
async function testSupplyChainRoutesAPI() {
  try {
    console.log('🚀 Testing Supply Chain Routes API...\n');
    
    // First, let's create some sample data
    console.log('📝 Creating sample supply chain routes...');
    
    const sampleRoutes = [
      {
        name: "Pharmaceutical Supply Chain Route",
        description: "Complete pharmaceutical supply chain from supplier to customer",
        routeType: "Supply Chain Route",
        id: "SCR-001",
        locations: [
          {
            id: "SUPPLIER_A",
            type: "supplier",
            x: 100,
            y: 100,
            name: "Supplier A",
            description: "Pharmaceutical raw material supplier",
            attributes: {}
          },
          {
            id: "CUSTOMER_B",
            type: "customer",
            x: 400,
            y: 100,
            name: "Customer B",
            description: "Pharmaceutical distributor",
            attributes: {}
          }
        ],
        connectors: [
          {
            id: "conn_pharma_001",
            from: "SUPPLIER_A",
            to: "CUSTOMER_B",
            parentId: "SUPPLIER_A",
            childId: "CUSTOMER_B",
            transportMode: "road",
            distance: 300,
            duration: 6,
            cost: 200,
            attributes: {}
          }
        ],
        hierarchicalStructure: {
          routeName: "Pharmaceutical Supply Chain Route",
          routeDescription: "Complete pharmaceutical supply chain",
          rootNodes: [],
          allLocations: {},
          allConnections: [],
          generatedAt: new Date().toISOString()
        },
        status: "active",
        tags: ["pharmaceutical", "healthcare"]
      },
      {
        name: "Chemical Supply Chain Route 2",
        description: "Chemical manufacturing supply chain",
        routeType: "Production Route",
        id: "SCR-002",
        locations: [
          {
            id: "CHEMICAL_PLANT_A",
            type: "manufacturer",
            x: 150,
            y: 200,
            name: "Chemical Plant A",
            description: "Primary chemical manufacturing facility",
            attributes: {}
          },
          {
            id: "MANUFACTURING_PLANT",
            type: "manufacturer",
            x: 350,
            y: 200,
            name: "Manufacturing Plant",
            description: "Secondary processing facility",
            attributes: {}
          },
          {
            id: "DISTRIBUTION_CENTER",
            type: "warehouse",
            x: 550,
            y: 200,
            name: "Distribution Center",
            description: "Storage and distribution hub",
            attributes: {}
          }
        ],
        connectors: [
          {
            id: "conn_chem_001",
            from: "CHEMICAL_PLANT_A",
            to: "MANUFACTURING_PLANT",
            parentId: "CHEMICAL_PLANT_A",
            childId: "MANUFACTURING_PLANT",
            transportMode: "pipeline",
            distance: 200,
            duration: 2,
            cost: 100,
            attributes: {}
          },
          {
            id: "conn_chem_002",
            from: "MANUFACTURING_PLANT",
            to: "DISTRIBUTION_CENTER",
            parentId: "MANUFACTURING_PLANT",
            childId: "DISTRIBUTION_CENTER",
            transportMode: "road",
            distance: 200,
            duration: 4,
            cost: 150,
            attributes: {}
          }
        ],
        hierarchicalStructure: {
          routeName: "Chemical Supply Chain Route 2",
          routeDescription: "Chemical manufacturing supply chain",
          rootNodes: [],
          allLocations: {},
          allConnections: [],
          generatedAt: new Date().toISOString()
        },
        status: "draft",
        tags: ["chemical", "manufacturing"]
      },
      {
        name: "Raw Material Supply Chain",
        description: "Raw material procurement and distribution",
        routeType: "Procurement Route",
        id: "SCR-003",
        locations: [
          {
            id: "RAW_MATERIAL_SUPPLIER",
            type: "supplier",
            x: 200,
            y: 300,
            name: "Raw Material Supplier",
            description: "Primary raw material source",
            attributes: {}
          },
          {
            id: "PRODUCTION_FACILITY",
            type: "manufacturer",
            x: 500,
            y: 300,
            name: "Production Facility",
            description: "Main production facility",
            attributes: {}
          }
        ],
        connectors: [
          {
            id: "conn_raw_001",
            from: "RAW_MATERIAL_SUPPLIER",
            to: "PRODUCTION_FACILITY",
            parentId: "RAW_MATERIAL_SUPPLIER",
            childId: "PRODUCTION_FACILITY",
            transportMode: "rail",
            distance: 300,
            duration: 8,
            cost: 300,
            attributes: {}
          }
        ],
        hierarchicalStructure: {
          routeName: "Raw Material Supply Chain",
          routeDescription: "Raw material procurement and distribution",
          rootNodes: [],
          allLocations: {},
          allConnections: [],
          generatedAt: new Date().toISOString()
        },
        status: "active",
        tags: ["raw-materials", "procurement"]
      }
    ];

    // Create routes one by one
    for (const route of sampleRoutes) {
      try {
        const createResponse = await axios.post('http://localhost:3001/api/supply-chain-routes', route);
        console.log(`✅ Created route: ${route.name} (${route.id})`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
          console.log(`⚠️  Route ${route.id} already exists, skipping...`);
        } else {
          console.log(`❌ Error creating route ${route.id}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log('\n📋 Fetching all supply chain routes...\n');

    // Now call the API to get the list
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'http://localhost:3001/api/supply-chain-routes',
      headers: {},
      data: ''
    };

    const response = await axios.request(config);
    
    console.log('🎉 API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Display summary
    if (response.data.success && response.data.data) {
      console.log(`\n📊 Summary:`);
      console.log(`- Total routes found: ${response.data.data.length}`);
      console.log(`- Routes:`);
      response.data.data.forEach((route, index) => {
        console.log(`  ${index + 1}. ${route.name} (${route.id}) - Status: ${route.status}`);
      });
    }

  } catch (error) {
    console.log('❌ Error calling API:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received:', error.message);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Run the test
testSupplyChainRoutesAPI();


