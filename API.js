const axios = require('axios');
const keys = require('./APIkeys');

async function requestGasPrice(){
  
  var gasPrice;

  await axios.get('https://www.etherchain.org/api/gasPriceOracle')
  .then(function (response) {
    gasPrice = response.data;
  })
  .catch(function (error) {
    console.log(error);
  });

  return gasPrice
}

async function requestData(){

    var map = {};

    await axios({
        methods: 'GET',
        url: keys.API.url,
        headers: {
          'X-CMC_PRO_API_KEY': keys.API.key
        },
        json: true,
        gzip: true
      }).then(res => {
        
        console.log("Doing API request (data)");
        const noStatus = res.data.data;
        
        for(let x of noStatus){
          map[x.symbol] = {
            latestPrice: x.quote.USD.price,
            change24h: x.quote.USD.percent_change_24h,
            change7d: x.quote.USD.percent_change_7d,
            marketCap: x.quote.USD.market_cap,
            volume24h: x.quote.USD.volume_24h,
            name: x.name,
            circulatingSuply: x.circulating_supply,
            totalSuply: x.total_supply,
            id: x.id
          };
        }
      });

    return map;
};

async function requestInfo(id){

  var info;

  await axios({
      methods: 'GET',
      url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id=${id}`,
      headers: {
        'X-CMC_PRO_API_KEY': keys.API.key
      },
      json: true,
      gzip: true
    }).then(res => {
      console.log("Doing API request (info)");

      info = res.data.data[id].logo;
    });

  return info;

};


async function requestAddressInfo(address){

  var result = {};

  await axios({
    methods: 'GET',
    url: `https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`,
    json: true,
    gzip: true
  }).then(res => {
    console.log("Doing API request (address)");

    result = {
      balance: res.data['ETH'].balance,
      price: res.data['ETH'].price.rate,
      storjName: res.data.tokens[0].tokenInfo.symbol,
      storjAmount: res.data.tokens[0].balance,
      storjPrice: res.data.tokens[0].tokenInfo.price.rate,
      storjDecimals: res.data.tokens[0].tokenInfo.decimals
    }
  });

  return result;
}

async function requestRealTimeData(pair){

  var result = {};

  await axios({
    methods: 'GET',
    url: keys.APIV2.url + pair,
    headers: {
      'X-MBX-APIKEY': keys.APIV2.key
    },
    json: true,
    gzip: true
  }).then(res => {
    console.log("Doing API request (real time data)");

    result = {
      priceChange: res.data.priceChange,
      priceChangePercent: res.data.priceChangePercent,
      lastPrice: res.data.lastPrice,
      openPrice: res.data.openPrice,
      highPrice: res.data.highPrice,
      lowPrice: res.data.lowPrice,
      volume: res.data.volume
    }
  });

  return result;
}


module.exports  = { requestData, requestGasPrice, requestInfo, requestAddressInfo, requestRealTimeData };