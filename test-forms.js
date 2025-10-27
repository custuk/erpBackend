const axios = require('axios');

// Test function to call the Forms API
async function testFormsAPI() {
  try {
    console.log('🚀 Testing Forms API...\n');
    
    // First, let's create some sample data
    console.log('📝 Creating sample forms...');
    
    const sampleForms = [
      {
        id: "form_1758666738899",
        name: "Material Creation Form",
        description: "Form for creating new material master data",
        version: "1.0.0",
        status: "draft",
        dataObject: "material",
        sapTable: "MARA",
        sapStructure: "BAPI_MATERIAL_SAVE",
        config: {
          layout: "vertical",
          columns: 1,
          spacing: "medium",
          showLabels: true,
          showRequiredIndicator: true,
          submitButtonText: "Save",
          cancelButtonText: "Cancel",
          resetButtonText: "Reset",
          showResetButton: false,
          autoSave: false,
          autoSaveInterval: 30000,
          validationMode: "onChange"
        },
        tabs: [
          {
            id: "main",
            name: "Main Information",
            description: "Primary data fields",
            order: 1,
            visible: true,
            sections: [
              {
                id: "main-section",
                name: "General Information",
                description: "Basic information fields",
                order: 1,
                visible: true,
                fields: [],
                layout: "grid",
                columns: 1,
                collapsible: false,
                collapsed: false
              }
            ]
          }
        ],
        fields: [],
        validation: {
          rules: [],
          customValidators: []
        },
        rules: [],
        createdBy: "current_user",
        updatedBy: "current_user",
        isActive: true,
        tags: ["material", "form", "creation"]
      },
      {
        id: "form_customer_registration",
        name: "Customer Registration Form",
        description: "Form for registering new customers",
        version: "1.0.0",
        status: "active",
        dataObject: "customer",
        sapTable: "KNA1",
        sapStructure: "BAPI_CUSTOMER_CREATE",
        config: {
          layout: "vertical",
          columns: 2,
          spacing: "medium",
          showLabels: true,
          showRequiredIndicator: true,
          submitButtonText: "Register",
          cancelButtonText: "Cancel",
          resetButtonText: "Clear",
          showResetButton: true,
          autoSave: true,
          autoSaveInterval: 60000,
          validationMode: "onBlur"
        },
        tabs: [
          {
            id: "personal",
            name: "Personal Information",
            description: "Customer personal details",
            order: 1,
            visible: true,
            sections: [
              {
                id: "basic-info",
                name: "Basic Information",
                description: "Name and contact details",
                order: 1,
                visible: true,
                fields: [],
                layout: "grid",
                columns: 2,
                collapsible: false,
                collapsed: false
              }
            ]
          }
        ],
        fields: [],
        validation: {
          rules: [
            {
              field: "email",
              type: "email",
              message: "Please enter a valid email address",
              enabled: true
            }
          ],
          customValidators: []
        },
        rules: [],
        createdBy: "admin_user",
        updatedBy: "admin_user",
        isActive: true,
        tags: ["customer", "registration", "business"]
      },
      {
        id: "form_order_processing",
        name: "Order Processing Form",
        description: "Form for processing customer orders",
        version: "1.0.0",
        status: "active",
        dataObject: "order",
        sapTable: "VBAK",
        sapStructure: "BAPI_SALESORDER_CREATE",
        config: {
          layout: "horizontal",
          columns: 3,
          spacing: "large",
          showLabels: true,
          showRequiredIndicator: true,
          submitButtonText: "Process Order",
          cancelButtonText: "Cancel",
          resetButtonText: "Reset",
          showResetButton: false,
          autoSave: true,
          autoSaveInterval: 30000,
          validationMode: "onSubmit"
        },
        tabs: [
          {
            id: "order-details",
            name: "Order Details",
            description: "Order information and items",
            order: 1,
            visible: true,
            sections: [
              {
                id: "order-header",
                name: "Order Header",
                description: "Order header information",
                order: 1,
                visible: true,
                fields: [],
                layout: "grid",
                columns: 2,
                collapsible: false,
                collapsed: false
              }
            ]
          }
        ],
        fields: [],
        validation: {
          rules: [
            {
              field: "customerId",
              type: "required",
              message: "Customer ID is required",
              enabled: true
            }
          ],
          customValidators: []
        },
        rules: [],
        createdBy: "order_admin",
        updatedBy: "order_admin",
        isActive: true,
        tags: ["order", "processing", "sales"]
      }
    ];

    // Create forms one by one
    for (const form of sampleForms) {
      try {
        const createResponse = await axios.post('http://localhost:3001/api/forms', form);
        console.log(`✅ Created form: ${form.name} (${form.id})`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
          console.log(`⚠️  Form ${form.id} already exists, skipping...`);
        } else {
          console.log(`❌ Error creating form ${form.id}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log('\n📋 Fetching all forms...\n');

    // Now call the API to get the list
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'http://localhost:3001/api/forms',
      headers: {},
      data: ''
    };

    const response = await axios.request(config);
    
    console.log('🎉 API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Display summary
    if (response.data.success && response.data.data) {
      console.log(`\n📊 Summary:`);
      console.log(`- Total forms found: ${response.data.data.length}`);
      console.log(`- Forms:`);
      response.data.data.forEach((form, index) => {
        console.log(`  ${index + 1}. ${form.name} (${form.id}) - Status: ${form.status} - Data Object: ${form.dataObject}`);
      });
    }

    // Test best match search
    console.log('\n🔍 Testing best match search...');
    try {
      const searchResponse = await axios.get('http://localhost:3001/api/forms?search=material&sortBy=bestMatch');
      console.log('Search results:', searchResponse.data.data.length, 'forms found');
    } catch (error) {
      console.log('Search error:', error.message);
    }

    // Test data object filter
    console.log('\n📂 Testing data object filter...');
    try {
      const dataObjectResponse = await axios.get('http://localhost:3001/api/forms?dataObject=material');
      console.log('Data object filter results:', dataObjectResponse.data.data.length, 'forms found');
    } catch (error) {
      console.log('Data object filter error:', error.message);
    }

    // Test statistics
    console.log('\n📈 Testing statistics...');
    try {
      const statsResponse = await axios.get('http://localhost:3001/api/forms/stats/overview');
      console.log('Statistics:', JSON.stringify(statsResponse.data.data.overview, null, 2));
    } catch (error) {
      console.log('Statistics error:', error.message);
    }

    // Test field types
    console.log('\n🔧 Testing field types...');
    try {
      const fieldTypesResponse = await axios.get('http://localhost:3001/api/forms/meta/field-types');
      console.log('Field types:', fieldTypesResponse.data.data.length, 'types available');
    } catch (error) {
      console.log('Field types error:', error.message);
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
testFormsAPI();
