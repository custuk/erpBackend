const axios = require('axios');

// Complete business rules data with correct structure
const businessRules = [
  {
    id: "MDM001",
    name: "Email Format Validation",
    description: "Validate email format using standard regex pattern",
    type: "validation",
    dataObject: "customer",
    status: "active",
    version: "1.0.0",
    createdBy: "John Doe",
    tags: ["email", "validation", "customer", "regex"],
    priority: 1,
    enabled: true,
    isActive: true,
    executionCount: 2340,
    successCount: 2320,
    failureCount: 20,
    regexPattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    conditions: [
      {
        id: 1,
        field: "email",
        operator: "regex",
        value: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "validate",
        field: "email",
        message: "Email format is invalid"
      }
    ]
  },
  {
    id: "MDM002",
    name: "VAT/Tax ID Check",
    description: "Validate VAT/Tax ID format based on country",
    type: "validation",
    dataObject: "customer",
    status: "active",
    version: "1.0.0",
    createdBy: "Jane Smith",
    tags: ["vat", "validation", "customer", "tax"],
    priority: 2,
    enabled: true,
    isActive: true,
    executionCount: 1890,
    successCount: 1848,
    failureCount: 42,
    conditions: [
      {
        id: 1,
        field: "vatId",
        operator: "isNotEmpty",
        value: "",
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "validate",
        field: "vatId",
        message: "VAT ID is required and must be valid for the specified country"
      }
    ]
  },
  {
    id: "MDM003",
    name: "Title Case Names",
    description: "Convert customer names to proper title case",
    type: "data",
    dataObject: "customer",
    status: "active",
    version: "1.0.0",
    createdBy: "Mike Johnson",
    tags: ["standardization", "customer", "names"],
    priority: 3,
    enabled: true,
    isActive: true,
    executionCount: 1456,
    successCount: 1456,
    failureCount: 0,
    conditions: [
      {
        id: 1,
        field: "firstName",
        operator: "isNotEmpty",
        value: "",
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "setValue",
        field: "firstName",
        value: "TITLE_CASE"
      }
    ]
  },
  {
    id: "MDM004",
    name: "Company Registration Number",
    description: "Validate company registration number format",
    type: "validation",
    dataObject: "supplier",
    status: "active",
    version: "1.0.0",
    createdBy: "Sarah Wilson",
    tags: ["validation", "supplier", "registration"],
    priority: 4,
    enabled: true,
    isActive: true,
    executionCount: 1123,
    successCount: 1084,
    failureCount: 39,
    conditions: [
      {
        id: 1,
        field: "registrationNumber",
        operator: "isNotEmpty",
        value: "",
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "validate",
        field: "registrationNumber",
        message: "Must be valid registration number for country"
      }
    ]
  },
  {
    id: "MDM005",
    name: "Base UoM Mandatory",
    description: "Base unit of measure is required",
    type: "validation",
    dataObject: "material",
    status: "active",
    version: "1.0.0",
    createdBy: "David Brown",
    tags: ["validation", "material", "uom"],
    priority: 5,
    enabled: true,
    isActive: true,
    executionCount: 3456,
    successCount: 3449,
    failureCount: 7,
    conditions: [
      {
        id: 1,
        field: "baseUom",
        operator: "isNotEmpty",
        value: "",
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "validate",
        field: "baseUom",
        message: "Base UoM is mandatory field"
      }
    ]
  },
  {
    id: "MDM006",
    name: "Postcode Format",
    description: "Validate postcode format based on country",
    type: "validation",
    dataObject: "location",
    status: "active",
    version: "1.0.0",
    createdBy: "Lisa Davis",
    tags: ["validation", "location", "postcode"],
    priority: 6,
    enabled: true,
    isActive: true,
    executionCount: 2789,
    successCount: 2737,
    failureCount: 52,
    conditions: [
      {
        id: 1,
        field: "postcode",
        operator: "isNotEmpty",
        value: "",
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "validate",
        field: "postcode",
        message: "Postcode must match country-specific format"
      }
    ]
  },
  {
    id: "TECH001",
    name: "Email RegEx Pattern",
    description: "Regular expression pattern for email validation",
    type: "validation",
    dataObject: "customer",
    status: "active",
    version: "1.0.0",
    createdBy: "Tech Team",
    tags: ["regex", "email", "pattern"],
    priority: 7,
    enabled: true,
    isActive: true,
    executionCount: 4567,
    successCount: 4542,
    failureCount: 25,
    regexPattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    conditions: [
      {
        id: 1,
        field: "email",
        operator: "regex",
        value: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "validate",
        field: "email",
        message: "Email must match valid pattern"
      }
    ]
  },
  {
    id: "TECH002",
    name: "Material Classification Check Table",
    description: "Check table for material classification validation",
    type: "data",
    dataObject: "material",
    status: "active",
    version: "1.0.0",
    createdBy: "Tech Team",
    tags: ["check-table", "material", "classification"],
    priority: 8,
    enabled: true,
    isActive: true,
    executionCount: 890,
    successCount: 847,
    failureCount: 43,
    checkTable: [
      {
        id: 1,
        field: "materialType",
        operator: "equals",
        value: "Raw Material",
        result: "Manufacturing"
      }
    ],
    conditions: [
      {
        id: 1,
        field: "materialType",
        operator: "isNotEmpty",
        value: "",
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "setValue",
        field: "classification",
        value: "LOOKUP_RESULT"
      }
    ]
  },
  {
    id: "TECH003",
    name: "Customer Credit Decision Table",
    description: "Decision table for customer credit approval",
    type: "business",
    dataObject: "customer",
    status: "active",
    version: "1.0.0",
    createdBy: "Business Team",
    tags: ["decision-table", "customer", "credit"],
    priority: 9,
    enabled: true,
    isActive: true,
    executionCount: 1234,
    successCount: 1201,
    failureCount: 33,
    decisionTable: [
      {
        id: 1,
        conditions: ["creditScore > 700", "orderValue < 10000"],
        actions: ["approve"],
        priority: 1
      }
    ],
    conditions: [
      {
        id: 1,
        field: "creditScore",
        operator: "greaterThan",
        value: 700,
        logicalOperator: "AND"
      },
      {
        id: 2,
        field: "orderValue",
        operator: "lessThan",
        value: 10000,
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "setValue",
        field: "creditApproval",
        value: "APPROVED"
      }
    ]
  },
  {
    id: "BR001",
    name: "Customer Credit Limit Validation",
    description: "Validates customer credit limits based on payment history and order value",
    type: "validation",
    dataObject: "customer",
    status: "active",
    version: "1.2.0",
    createdBy: "Jane Smith",
    tags: ["credit", "validation", "customer"],
    priority: 10,
    enabled: true,
    isActive: true,
    executionCount: 1250,
    successCount: 1231,
    failureCount: 19,
    conditions: [
      {
        id: 1,
        field: "creditLimit",
        operator: "greaterThan",
        value: 0,
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "validate",
        field: "creditLimit",
        message: "Credit limit must be positive"
      }
    ]
  },
  {
    id: "BR002",
    name: "Order Discount Calculation",
    description: "Calculates order discounts based on customer tier, order value, and promotional codes",
    type: "calculation",
    dataObject: "customer",
    status: "draft",
    version: "2.0.0",
    createdBy: "Mike Johnson",
    tags: ["discount", "calculation", "pricing"],
    priority: 11,
    enabled: false,
    isActive: true,
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    conditions: [
      {
        id: 1,
        field: "customerTier",
        operator: "isNotEmpty",
        value: "",
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "calculate",
        field: "discount",
        value: "CALCULATED_DISCOUNT"
      }
    ]
  },
  {
    id: "BR003",
    name: "Inventory Reorder Decision",
    description: "Determines when to reorder inventory based on stock levels, demand patterns, and supplier lead times",
    type: "business",
    dataObject: "material",
    status: "active",
    version: "1.5.0",
    createdBy: "Sarah Wilson",
    tags: ["inventory", "reorder", "supply-chain"],
    priority: 12,
    enabled: true,
    isActive: true,
    executionCount: 850,
    successCount: 818,
    failureCount: 32,
    conditions: [
      {
        id: 1,
        field: "stockLevel",
        operator: "lessThan",
        value: "reorderPoint",
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "setValue",
        field: "reorderRequired",
        value: true
      }
    ]
  },
  {
    id: "BR004",
    name: "Product Price Validation",
    description: "Validates product prices against minimum and maximum thresholds",
    type: "validation",
    dataObject: "material",
    status: "active",
    version: "1.0.0",
    createdBy: "John Doe",
    tags: ["price", "validation", "product"],
    priority: 13,
    enabled: true,
    isActive: true,
    executionCount: 2100,
    successCount: 2081,
    failureCount: 19,
    conditions: [
      {
        id: 1,
        field: "price",
        operator: "greaterThan",
        value: 0,
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "validate",
        field: "price",
        message: "Price must be within valid range"
      }
    ]
  },
  {
    id: "BR005",
    name: "Customer Tier Assignment",
    description: "Assigns customer tiers based on purchase history and account value",
    type: "data",
    dataObject: "customer",
    status: "archived",
    version: "0.9.0",
    createdBy: "Jane Smith",
    tags: ["customer", "tier", "assignment"],
    priority: 14,
    enabled: false,
    isActive: false,
    executionCount: 3200,
    successCount: 3136,
    failureCount: 64,
    conditions: [
      {
        id: 1,
        field: "totalOrders",
        operator: "greaterThan",
        value: 10000,
        logicalOperator: "AND"
      }
    ],
    actions: [
      {
        id: 1,
        type: "setValue",
        field: "tier",
        value: "Premium"
      }
    ]
  }
];

// Function to seed business rules
async function seedBusinessRules() {
  const baseURL = 'http://localhost:3001/api/business-rules';
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  console.log('🌱 Starting to seed business rules...\n');

  for (let i = 0; i < businessRules.length; i++) {
    const rule = businessRules[i];
    
    try {
      console.log(`📝 Creating rule ${i + 1}/${businessRules.length}: ${rule.name} (${rule.id})`);
      
      const response = await axios.post(baseURL, rule);
      
      if (response.data.success) {
        console.log(`   ✅ Success: ${rule.name}`);
        console.log(`   📋 Rule ID: ${response.data.data._id}`);
        successCount++;
      } else {
        console.log(`   ❌ API Error: ${response.data.message}`);
        if (response.data.errors) {
          console.log(`   📝 Validation Errors: ${response.data.errors.join(', ')}`);
        }
        errorCount++;
        errors.push({
          rule: rule.name,
          id: rule.id,
          error: response.data.message,
          details: response.data.errors
        });
      }
      
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
      if (error.response) {
        console.log(`   📊 Status: ${error.response.status}`);
        console.log(`   📝 Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      errorCount++;
      errors.push({
        rule: rule.name,
        id: rule.id,
        error: error.message,
        details: error.response?.data
      });
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`   ✅ Successfully created: ${successCount} rules`);
  console.log(`   ❌ Failed to create: ${errorCount} rules`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.rule} (${error.id}): ${error.error}`);
      if (error.details) {
        console.log(`      Details: ${JSON.stringify(error.details, null, 2)}`);
      }
    });
  }

  console.log('\n🎉 Business rules seeding completed!');
}

// Run the seeding function
seedBusinessRules().catch(error => {
  console.error('💥 Fatal error during seeding:', error.message);
  process.exit(1);
});

