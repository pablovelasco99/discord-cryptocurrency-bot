const Discord = require('discord.js');
const client = new Discord.Client();
const {requestData, requestGasPrice, requestInfo, requestAddressInfo,
  requestRealTimeData} = require('./api/API');
const keys = require('./config/APIkeys');

const pool = require('./database/database');


client.on('ready', () => {
    console.log(`Logged as ${client.user.tag}`);
});

client.on('message', async (msg) => {

    //Option disabled 
    /*if(msg.content.substr(0, 5) === '!info'){
      
      let wantedData = msg.content.substr(6, msg.content.length).toUpperCase();
      let request = await requestData();      
      var symbols = Object.entries(request);
      var i = 0;
      while(symbols[i][0] != wantedData){
        i++;
      }
      var info = await requestInfo(symbols[i][1].id);
      var embed = new Discord.MessageEmbed().setAuthor('Harry Stonks')
        .setThumbnail(info)
        .setDescription(`Here you have real time information of ${symbols[i][1].name}`)
        .setColor('0xFFFF00')
        .addField('Crypto', wantedData)
        .addField('Current price', new Intl.NumberFormat("de-DE", {style: "currency", currency: "USD"}).format(symbols[i][1].latestPrice.toFixed(2)))
        .addField('Market Cap', new Intl.NumberFormat("de-DE", {style: "currency", currency: "USD"}).format(symbols[i][1].marketCap.toFixed(2)))
        .addField('Circulating suply', new Intl.NumberFormat("de-DE").format(symbols[i][1].circulatingSuply) + " " + wantedData)
        .addField('Total suply', new Intl.NumberFormat("de-DE", {style: "currency", currency: "USD"}).format(symbols[i][1].totalSuply))
        .setTimestamp('https://cdn.pixabay.com/photo/2017/01/25/12/31/bitcoin-2007769_960_720.jpg');
      
      if(symbols[i][1].change24h < 0){
        embed.addField('24h %', new Intl.NumberFormat("de-DE")
          .format(symbols[i][1].change24h.toFixed(2)) + ' ↘️')
          .setImage('https://pbs.twimg.com/media/EQS914dWAAUzbap.jpg');
      }else{
        embed.addField('24h %', new Intl.NumberFormat("de-DE")
          .format(symbols[i][1].change24h.toFixed(2)) + ' ↗️')
          .setImage('https://as.com/meristation/imagenes/2021/04/01/noticias/1617282876_321096_1617283489_sumario_normal.jpg');
      }

      msg.channel.send(embed);
    }*/

    if(msg.content.substr(0, 6) === '!price'){
      
      let data = msg.content.substr(6, msg.content.length).toUpperCase().trim();
      let request = await requestRealTimeData(data);

      var embed = new Discord.MessageEmbed().setAuthor('Harry Stonks')
                .setDescription(`Here you have real time information about ${data} in the last 24 hours`)
                .setColor('0xFFFF00')
                .addField('Current Price ', new Intl.NumberFormat("de-DE").format(request.lastPrice))
                .addField('Price Change ', new Intl.NumberFormat("de-DE").format(request.priceChange))
                .addField('Price Change %', new Intl.NumberFormat("de-DE").format(request.priceChangePercent))
                .addField('Open Price ', new Intl.NumberFormat("de-DE").format(request.openPrice))
                .addField('High Price ', new Intl.NumberFormat("de-DE").format(request.highPrice))
                .addField('Low Price ', new Intl.NumberFormat("de-DE").format(request.lowPrice))
                .addField('Volume ', new Intl.NumberFormat("de-DE").format(request.volume));

      if(request.priceChangePercent < 0){
        embed.setImage('https://pbs.twimg.com/media/EQS914dWAAUzbap.jpg');
      }else{
        embed.setImage('https://as.com/meristation/imagenes/2021/04/01/noticias/1617282876_321096_1617283489_sumario_normal.jpg');
      }

      msg.channel.send(embed);
    }
    

    if(msg.content === '!gasprice'){

      let gasPrice = await requestGasPrice();

      const embed = new Discord.MessageEmbed().setAuthor('Harry Stonks')
      .setThumbnail('https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png')
      .setColor('0xFFFF00').setDescription('Here you have the gas price')
      .addField('SafeLow', gasPrice.safeLow + ' GWei')
      .addField('Standard', gasPrice.standard + ' GWei')
      .addField('Fast', gasPrice.fast + ' GWei')
      .addField('Fastest', gasPrice.fastest + ' GWei');
       
      msg.channel.send(embed);
    }

    if(msg.content.substr(0, 8) === '!address'){

      let addressInfo = await requestAddressInfo(msg.content.substr(9, msg.content.length));
      let decimals = 10**addressInfo.storjDecimals
      var totalCryptos;

      if(addressInfo.balance > 0){
        totalCryptos = addressInfo.balance.toFixed(8) + " ETH\n";
      }
      if(addressInfo.storjAmount > 0){
        totalCryptos += (addressInfo.storjAmount)/decimals + " " + addressInfo.storjName;
      }else{
        totalCryptos = "0.00000000";
      }

      let totalAmoun = addressInfo.balance * addressInfo.price + (addressInfo.storjAmount)/decimals * addressInfo.storjPrice;

      const embed = new Discord.MessageEmbed().setAuthor('Harry Stonks')
      .setThumbnail('https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png')
      .setColor('0xFFFF00')
      .setDescription('Here you have the balance of your address')
      .addField('Balance', totalCryptos)
      .addField('Value', totalAmoun.toFixed(2) + ' $');

      msg.channel.send(embed);
    }

    if(msg.content.substr(0, 5) === '!help'){
      const embed = new Discord.MessageEmbed().setAuthor('Harry Stonks')
      .setColor('0xFFFF00')
      .setDescription(
        'Harry Cryptos is a bot that allows you to obtain information about different data of crypto world.\n\n' + '**Commands**\n' + '🗃  '
        + '**!price:** <pair you want to search>\n\n' + '🛢  ' + '**!gasprice:** return gas cost of an ETH operation\n\n' + '⚖️  ' 
        + '**!address:** <address you want to get info about>');
      msg.channel.send(embed);
    }

    if(msg.content === '!register'){

      let query = await pool.query('SELECT id FROM user WHERE id=?', msg.author.id);

      if(query == 0){

        let data = {
          id: msg.author.id,
          start_balance: 10000,
          available_money: 10000
        };

        await pool.query('INSERT INTO user SET ?', data);
        console.log('Done');

      }else{
        console.log('User already exists');
      }
    }

    if(msg.content === '!balance'){

      let userQuery = await pool.query('SELECT start_balance, available_money FROM user WHERE id=?', msg.author.id);
      
      if(userQuery == 0){

        console.log('Sorry, you are not registered');

      }else{

        let walletQuery = await pool.query('SELECT SUM(total_money) AS total_balance FROM wallet WHERE total_money > 0');
        
        let balance = {
          start_balance: userQuery[0].start_balance,
          actual_balance: parseFloat(userQuery[0].available_money) + parseFloat(walletQuery[0].total_balance)
        };

        console.log(balance);
      }
      
    }

    if(msg.content.substr(0, 4) === '!buy'){

      let query = await pool.query('SELECT * FROM user WHERE id=?', msg.author.id);

      if(query == 0){

        console.log('Sorry, you are not registered');
      }else{
        let flag = msg.content.indexOf('-');
        let amount = msg.content.substr(flag+1, msg.content.length);
        let crypto = msg.content.substring(4, flag).toUpperCase().trim();
        let request = await requestRealTimeData(crypto);

        if(amount * request.lastPrice > query[0].available_money){
          console.log('Not enought money');
        }else{
          let walletQuery = await pool.query('SELECT * FROM wallet WHERE userID = ? AND crypto = ?', [msg.author.id, crypto]);
          let userQuery = await pool.query('SELECT * FROM user WHERE id = ?', [msg.author.id]);
          let x = 0;
          let walletData = {
            amount: amount,
            crypto: crypto,
            userID: msg.author.id,
            total_money: amount * request.lastPrice
          };

          if(walletQuery == 0){
            
            await pool.query('INSERT INTO wallet SET ?', [walletData]);
            walletQuery = await pool.query('SELECT * FROM wallet WHERE userID = ? AND crypto = ?', [msg.author.id, crypto]);

            let historicalData = {
              amount: amount,
              crypto: crypto,
              price: request.lastPrice,
              total_amount: amount * request.lastPrice,
              order_type: 'buy',
              idWallet: walletQuery[0].id
            };

            await pool.query('INSERT INTO historical SET ?', [historicalData]);

          }else{
            
            let historicalData = {
              amount: amount,
              crypto: crypto,
              price: request.lastPrice,
              total_amount: amount * request.lastPrice,
              order_type: 'buy',
              idWallet: walletQuery[0].id
            };
            await pool.query('INSERT INTO historical SET ?', [historicalData]);
            await pool.query('UPDATE wallet SET amount = ?, total_money = ? WHERE id = ?', 
              [parseFloat(walletQuery[0].amount) + parseFloat(amount), parseFloat(walletQuery[0].amount) + parseFloat(amount) * request.lastPrice, walletQuery[0].id]);
            x = parseFloat(walletQuery[0].amount) + parseFloat(amount) * request.lastPrice;
          }
          await pool.query('UPDATE user SET available_money = ? WHERE id = ?', 
            [parseFloat(userQuery[0].available_money) - amount * request.lastPrice, msg.author.id]);
        }
        console.log('Done');
      }

    }

    if(msg.content.substr(0, 5) === '!sell'){

      let query = await pool.query('SELECT * FROM user WHERE id=?', msg.author.id);

      if(query == 0){

        console.log('Sorry, you are not registered');
      }else{

        let userQuery = await pool.query('SELECT * FROM user WHERE id = ?', [msg.author.id]);
        
        let flag = msg.content.indexOf('-');
        let crypto = msg.content.substring(5, flag).toUpperCase().trim();
        let amount = msg.content.substr(flag+1, msg.content.length);
        let data = msg.content.substring(5, flag).toUpperCase().trim();
        let request = await requestRealTimeData(data);

        let orderQuery = await pool.query('SELECT * FROM wallet WHERE userID =?', msg.author.id);

        if(orderQuery == 0 || orderQuery[0].amount < amount){
          console.log('You dont have that amount');
        }else{
          let historicalData = {
            amount: amount,
            crypto: crypto,
            price: request.lastPrice,
            total_amount: amount * request.lastPrice,
            order_type: 'sell',
            idWallet: orderQuery[0].id
          };

          await pool.query('UPDATE wallet SET amount = ?, total_money = ? WHERE userID = ?', 
            [parseFloat(orderQuery[0].amount) - amount, (parseFloat(orderQuery[0].amount) - amount) * request.lastPrice, msg.author.id]);
          await pool.query('INSERT INTO historical SET ?', [historicalData]);
          await pool.query('UPDATE user SET available_money = ? WHERE id = ?', 
            [parseFloat(userQuery[0].available_money) + amount * request.lastPrice, msg.author.id]);
        }
        console.log(orderQuery);
      }

    }
  
});


client.login(keys.DISCORD.key);