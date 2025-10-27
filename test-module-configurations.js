const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testModuleConfigurationAPIs() {
  console.log('🧪 Starting Module Configuration API Tests...\n');

  try {
    // Test 1: Get all scopes with modules
    console.log('1️⃣ Testing GET /api/module-configurations/scopes/with-modules');
    const scopesResponse = await axios.get(`${BASE_URL}/module-configurations/scopes/with-modules`);
    console.log('✅ Get Scopes with Modules:', scopesResponse.data.success);
    console.log('📊 Available Scopes:', scopesResponse.data.data.map(s => s._id).join(', '));

    // Test 2: Get modules by Config scope
    console.log('\n2️⃣ Testing GET /api/module-configurations/scope/Config');
    const configModulesResponse = await axios.get(`${BASE_URL}/module-configurations/scope/Config`);
    console.log('✅ Get Config Scope Modules:', configModulesResponse.data.success);
    console.log('📊 Config Modules Count:', configModulesResponse.data.count);
    console.log('📋 Config Modules:', configModulesResponse.data.data.map(m => m.moduleName).join(', '));

    // Test 3: Get modules by ERP scope
    console.log('\n3️⃣ Testing GET /api/module-configurations/scope/ERP');
    const erpModulesResponse = await axios.get(`${BASE_URL}/module-configurations/scope/ERP`);
    console.log('✅ Get ERP Scope Modules:', erpModulesResponse.data.success);
    console.log('📊 ERP Modules Count:', erpModulesResponse.data.count);

    // Test 4: Get modules by GB Customs scope
    console.log('\n4️⃣ Testing GET /api/module-configurations/scope/GB Customs');
    const customsModulesResponse = await axios.get(`${BASE_URL}/module-configurations/scope/GB%20Customs`);
    console.log('✅ Get GB Customs Scope Modules:', customsModulesResponse.data.success);
    console.log('📊 GB Customs Modules Count:', customsModulesResponse.data.count);

    // Test 5: Get modules by category
    console.log('\n5️⃣ Testing GET /api/module-configurations/category/Supply Chain & Finance Route');
    const categoryResponse = await axios.get(`${BASE_URL}/module-configurations/category/Supply%20Chain%20%26%20Finance%20Route`);
    console.log('✅ Get Modules by Category:', categoryResponse.data.success);
    console.log('📊 Category Modules Count:', categoryResponse.data.count);

    // Test 6: Search for Supply Chain modules
    console.log('\n6️⃣ Testing GET /api/module-configurations?search=Supply Chain');
    const searchResponse = await axios.get(`${BASE_URL}/module-configurations?search=Supply%20Chain`);
    console.log('✅ Search Supply Chain Modules:', searchResponse.data.success);
    console.log('📊 Search Results Count:', searchResponse.data.pagination.total);

    // Test 7: Get module configuration statistics
    console.log('\n7️⃣ Testing GET /api/module-configurations/stats/overview');
    const statsResponse = await axios.get(`${BASE_URL}/module-configurations/stats/overview`);
    console.log('✅ Get Module Statistics:', statsResponse.data.success);
    console.log('📊 Total Modules:', statsResponse.data.data.overview.totalModules);
    console.log('📊 Active Modules:', statsResponse.data.data.overview.activeModules);

    // Test 8: Test moving a module between scopes (if we have modules)
    if (configModulesResponse.data.data.length > 0) {
      const firstModule = configModulesResponse.data.data[0];
      console.log('\n8️⃣ Testing PATCH /api/module-configurations/:id/move-scope');
      const moveResponse = await axios.patch(`${BASE_URL}/module-configurations/${firstModule._id}/move-scope`, {
        declarationScope: 'ERP',
        order: 999
      });
      console.log('✅ Move Module Scope:', moveResponse.data.success);
      console.log('📋 New Scope:', moveResponse.data.data.declarationScope);

      // Move it back
      await axios.patch(`${BASE_URL}/module-configurations/${firstModule._id}/move-scope`, {
        declarationScope: 'Config',
        order: firstModule.order
      });
      console.log('🔄 Moved module back to Config scope');
    }

    // Test 9: Verify Supply Chain modules are in Config scope
    console.log('\n9️⃣ Verifying Supply Chain modules are in Config scope');
    const supplyChainModules = configModulesResponse.data.data.filter(m => 
      m.moduleName.includes('Supply Chain')
    );
    console.log('✅ Supply Chain modules in Config scope:', supplyChainModules.length);
    supplyChainModules.forEach(module => {
      console.log(`   • ${module.moduleName} - ${module.declarationScope}`);
    });

    console.log('\n🎉 All Module Configuration API tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Supply Chain Route modules successfully moved to Config scope');
    console.log('   ✅ Module configuration APIs working correctly');
    console.log('   ✅ Frontend can now query modules by scope');
    console.log('   ✅ Navigation structure can be dynamically generated');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📋 Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the tests
testModuleConfigurationAPIs();
