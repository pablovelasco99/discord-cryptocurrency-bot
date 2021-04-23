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
        'Harry Cryptos is a bot that allows you to obtain information about different data of crypto world.\n\n' + '**Commands**\n\n'
        + '**!price:** <pair you want to search>\n\n' + '**!gasprice:** return gas cost of an ETH operation\n\n' 
        + '**!address:** <address you want to get info about>\n\n **!register:** register your user to trade cryptos \n\n'
        + '**!balance:** shows your current account balance\n\n **!buy:** <pair and quantity you want to buy>\n\n'
        + '**!sell:** <pair and quantity you want to sell>\n\n **Example:**\n !buy ADAUSDT-400 -> buy 400 ADAUSDT at current price\n'
        + '!sell ADAUSDT-20 -> sell 20 ADAUSDT at current price');
      msg.channel.send(embed);
    }

    if(msg.content === '!register'){

      let query = await pool.query('SELECT id FROM user WHERE id=?', msg.author.id);

      const embed = new Discord.MessageEmbed().setAuthor('Harry Stonks')
      .setColor('0xFFFF00');

      if(query == 0){

        let data = {
          id: msg.author.id,
          start_balance: 10000,
          available_money: 10000
        };

        await pool.query('INSERT INTO user SET ?', data);
        
        embed.setDescription('Registered successfully')

      }else{
        embed.setDescription('Sorry, user already exists')
      }

      msg.channel.send(embed);

    }

    if(msg.content === '!balance'){

      let userQuery = await pool.query('SELECT start_balance, available_money FROM user WHERE id=?', msg.author.id);
      
      const embed = new Discord.MessageEmbed().setAuthor('Harry Stonks')
      .setColor('0xFFFF00');

      if(userQuery == 0){

        embed.setDescription('Sorry, you are not registered');
      }else{

        let walletQuery = await pool.query('SELECT amount, crypto FROM wallet WHERE userID = ?', [msg.author.id]);

        let total = 0;

        for(const data in walletQuery){
          console.log(walletQuery[data]);
          let request = await requestRealTimeData(walletQuery[data].crypto);
          total += request.lastPrice * walletQuery[data].amount;
        }

        embed.setDescription('Here you have your balance')
        .addField('**Start balance:** ', userQuery[0].start_balance)
        .addField('**Actual balance:**',  parseFloat(userQuery[0].available_money) + total);

        msg.channel.send(embed);
      }
      
    }

    if(msg.content.substr(0, 4) === '!buy'){

      let query = await pool.query('SELECT * FROM user WHERE id=?', msg.author.id);

      const embed = new Discord.MessageEmbed().setAuthor('Harry Stonks')
      .setColor('0xFFFF00');

      if(query == 0){
        embed.setDescription('Sorry, you are not registered');
      }else{
        let flag = msg.content.indexOf('-');
        let amount = msg.content.substr(flag+1, msg.content.length);
        let crypto = msg.content.substring(4, flag).toUpperCase().trim();
        let request = await requestRealTimeData(crypto);

        amount = parseFloat(amount);

        if(amount * request.lastPrice > query[0].available_money){
          embed.setDescription('Sorry, you dont have enough money');
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
              
          }
          await pool.query('UPDATE user SET available_money = ? WHERE id = ?', 
            [parseFloat(userQuery[0].available_money) - amount * request.lastPrice, msg.author.id]);
          embed.setDescription('Successful purchase');
        }
      }
      msg.channel.send(embed);
    }

    if(msg.content.substr(0, 5) === '!sell'){

      let query = await pool.query('SELECT * FROM user WHERE id=?', msg.author.id);

      const embed = new Discord.MessageEmbed().setAuthor('Harry Stonks')
      .setColor('0xFFFF00');

      if(query == 0){

        embed.setDescription('Sorry, you are not registered');
      }else{

        let userQuery = await pool.query('SELECT * FROM user WHERE id = ?', [msg.author.id]);
        
        let flag = msg.content.indexOf('-');
        let crypto = msg.content.substring(5, flag).toUpperCase().trim();
        let amount = msg.content.substr(flag+1, msg.content.length);
        let data = msg.content.substring(5, flag).toUpperCase().trim();
        let request = await requestRealTimeData(data);

        amount = parseFloat(amount);
        
        let orderQuery = await pool.query('SELECT * FROM wallet WHERE userID =? AND crypto =?', [msg.author.id, crypto]);

        if(orderQuery == 0 || parseFloat(orderQuery[0].amount) < amount){
          embed.setDescription('Sorry, you dont have that amount');
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
          embed.setDescription('Successful sale');
        }
      }
      msg.channel.send(embed);

    }
  
});


client.login(keys.DISCORD.key);