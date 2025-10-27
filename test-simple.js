const axios = require('axios');

let data = '';

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'http://localhost:3001/api/supply-chain-routes',
  headers: { },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data, null, 2));
})
.catch((error) => {
  console.log(error);
});


