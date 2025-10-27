const axios = require('axios');

// Test script to demonstrate the new task templates API with items array
async function testTaskTemplatesWithItems() {
    const baseURL = 'http://localhost:3001/api/task-templates';
    
    try {
        console.log('🧪 Testing Task Templates API with Items Array\n');
        
        // Test 1: Create a new task template with items
        console.log('1️⃣ Creating a new task template with items...');
        const newTemplate = {
            name: "Material Request Processing Template",
            description: "Template for processing material requests with tasks and data objects",
            templateType: "Task and Data Object Template",
            items: [
                {
                    id: "item_001",
                    name: "Validate Material Request",
                    type: "task",
                    sequence: 1,
                    mandatory: true,
                    dependency: null,
                    parallelExecution: false,
                    estimatedDuration: 30,
                    assignedTo: "material_analyst",
                    priority: "High",
                    notes: "Validate material specifications and requirements"
                },
                {
                    id: "item_002", 
                    name: "Check Inventory Levels",
                    type: "task",
                    sequence: 2,
                    mandatory: true,
                    dependency: "item_001",
                    parallelExecution: false,
                    estimatedDuration: 15,
                    assignedTo: "inventory_manager",
                    priority: "Medium",
                    notes: "Check current inventory levels for requested materials"
                },
                {
                    id: "item_003",
                    name: "Material Specifications Form",
                    type: "dataObject",
                    sequence: 3,
                    mandatory: true,
                    dependency: "item_001",
                    parallelExecution: true,
                    estimatedDuration: 20,
                    assignedTo: "quality_engineer",
                    priority: "Medium",
                    notes: "Complete material specifications form",
                    selectedForm: "form_mat_spec_001",
                    formId: "form_mat_spec_001",
                    formName: "Material Specifications Form"
                },
                {
                    id: "item_004",
                    name: "Approval Workflow",
                    type: "task",
                    sequence: 4,
                    mandatory: true,
                    dependency: "item_002",
                    parallelExecution: false,
                    estimatedDuration: 45,
                    assignedTo: "department_manager",
                    priority: "High",
                    notes: "Process approval workflow for material request"
                }
            ],
            createdBy: "system_admin"
        };

        const createResponse = await axios.post(baseURL, newTemplate);
        console.log('✅ Template created successfully!');
        console.log(`   Template ID: ${createResponse.data.data._id}`);
        console.log(`   Template Name: ${createResponse.data.data.name}`);
        console.log(`   Items Count: ${createResponse.data.data.items.length}\n`);

        const templateId = createResponse.data.data._id;

        // Test 2: Get all templates
        console.log('2️⃣ Fetching all templates...');
        const getAllResponse = await axios.get(baseURL);
        console.log(`✅ Found ${getAllResponse.data.data.length} templates\n`);

        // Test 3: Get template by ID
        console.log('3️⃣ Fetching template by ID...');
        const getByIdResponse = await axios.get(`${baseURL}/${templateId}`);
        console.log('✅ Template retrieved successfully!');
        console.log(`   Template: ${getByIdResponse.data.data.name}`);
        console.log(`   Items: ${getByIdResponse.data.data.items.length}\n`);

        // Test 4: Search templates by item type
        console.log('4️⃣ Searching templates by item type (task)...');
        const taskTemplatesResponse = await axios.get(`${baseURL}/by-item-type/task`);
        console.log(`✅ Found ${taskTemplatesResponse.data.data.length} templates with task items\n`);

        console.log('5️⃣ Searching templates by item type (dataObject)...');
        const dataObjectTemplatesResponse = await axios.get(`${baseURL}/by-item-type/dataObject`);
        console.log(`✅ Found ${dataObjectTemplatesResponse.data.data.length} templates with data object items\n`);

        // Test 5: Get item types metadata
        console.log('6️⃣ Fetching item types metadata...');
        const itemTypesResponse = await axios.get(`${baseURL}/meta/item-types`);
        console.log('✅ Item types retrieved:');
        itemTypesResponse.data.data.forEach(type => {
            console.log(`   - ${type}`);
        });
        console.log();

        // Test 6: Search by item ID
        console.log('7️⃣ Searching templates by item ID...');
        const itemSearchResponse = await axios.get(`${baseURL}/search/by-item/item_001`);
        console.log(`✅ Found ${itemSearchResponse.data.data.length} templates containing item_001\n`);

        // Test 7: Update template
        console.log('8️⃣ Updating template...');
        const updateData = {
            name: "Updated Material Request Processing Template",
            description: "Updated description for material request processing",
            items: [
                ...newTemplate.items,
                {
                    id: "item_005",
                    name: "Final Review",
                    type: "task",
                    sequence: 5,
                    mandatory: true,
                    dependency: "item_004",
                    parallelExecution: false,
                    estimatedDuration: 15,
                    assignedTo: "senior_manager",
                    priority: "High",
                    notes: "Final review and approval"
                }
            ]
        };

        const updateResponse = await axios.put(`${baseURL}/${templateId}`, updateData);
        console.log('✅ Template updated successfully!');
        console.log(`   Updated Items Count: ${updateResponse.data.data.items.length}\n`);

        // Test 8: Get statistics
        console.log('9️⃣ Fetching template statistics...');
        const statsResponse = await axios.get(`${baseURL}/stats/overview`);
        console.log('✅ Statistics retrieved:');
        console.log(`   Total Templates: ${statsResponse.data.data.overview.totalTemplates}`);
        console.log(`   Active Templates: ${statsResponse.data.data.overview.activeTemplates}`);
        console.log(`   Average Items per Template: ${statsResponse.data.data.overview.averageItemsPerTemplate.toFixed(2)}`);
        console.log(`   Item Types: ${statsResponse.data.data.byItemType.map(item => `${item._id} (${item.count})`).join(', ')}\n`);

        // Test 9: Search with filters
        console.log('🔟 Testing search with filters...');
        const searchResponse = await axios.get(`${baseURL}?search=Material&templateType=Task and Data Object Template&limit=5`);
        console.log(`✅ Search completed: Found ${searchResponse.data.data.length} templates matching criteria\n`);

        // Test 10: Delete template
        console.log('1️⃣1️⃣ Deleting template...');
        const deleteResponse = await axios.delete(`${baseURL}/${templateId}`);
        console.log('✅ Template deleted successfully!\n');

        console.log('🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
    }
}

// Run the test
testTaskTemplatesWithItems();

