const Discord = require('discord.js');
const client = new Discord.Client();
const {requestData, requestGasPrice, requestInfo, requestAddressInfo} = require('./API');
const keys = require('./APIkeys');


client.on('ready', () => {
    console.log(`Logged as ${client.user.tag}`);
});

client.on('message', async (msg) => {

    if(msg.content.substr(0, 5) === '!info'){

      let wantedData = msg.content.substr(6, msg.content.length).toUpperCase();
      let request = await requestData();      
      var symbols = Object.entries(request);
      var i = 0;
      while(symbols[i][0] != wantedData){
        i++;
      }
      var info = await requestInfo(symbols[i][1].id);
      var embed = new Discord.MessageEmbed().setAuthor('Harry Stonks').setThumbnail(info)
        .setDescription(`Here you have real time information of ${symbols[i][1].name}`).setColor('0xFFFF00').addField('Crypto', wantedData)
        .addField('Current price', new Intl.NumberFormat("de-DE", {style: "currency", currency: "USD"}).format(symbols[i][1].latestPrice.toFixed(2))).addField('Market Cap', new Intl.NumberFormat("de-DE", {style: "currency", currency: "USD"}).format(symbols[i][1].marketCap.toFixed(2)))
        .addField('Circulating suply', new Intl.NumberFormat("de-DE").format(symbols[i][1].circulatingSuply) + " " + wantedData).addField('Total suply', new Intl.NumberFormat("de-DE", {style: "currency", currency: "USD"}).format(symbols[i][1].totalSuply)).setTimestamp('https://cdn.pixabay.com/photo/2017/01/25/12/31/bitcoin-2007769_960_720.jpg');
      
      if(symbols[i][1].change24h < 0){
        embed.addField('24h %', new Intl.NumberFormat("de-DE").format(symbols[i][1].change24h.toFixed(2)) + ' ↘️').setImage('https://pbs.twimg.com/media/EQS914dWAAUzbap.jpg');
      }else{
        embed.addField('24h %', new Intl.NumberFormat("de-DE").format(symbols[i][1].change24h.toFixed(2)) + ' ↗️').setImage('https://as.com/meristation/imagenes/2021/04/01/noticias/1617282876_321096_1617283489_sumario_normal.jpg');
      }

      msg.channel.send(embed);
    }

    if(msg.content === '!gasprice'){

      let gasPrice = await requestGasPrice();

      const embed = new Discord.MessageEmbed().setAuthor('Harry Stonks').setThumbnail('https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png').setColor('0xFFFF00').setDescription('Here you have the gas price')
      .addField('SafeLow', gasPrice.safeLow + ' GWei').addField('Standard', gasPrice.standard + ' GWei').addField('Fast', gasPrice.fast + ' GWei').addField('Fastest', gasPrice.fastest + ' GWei');
       
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

      const embed = new Discord.MessageEmbed().setAuthor('Harry Stonks').setThumbnail('https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png').setColor('0xFFFF00')
      .setDescription('Here you have the balance of your address').addField('Balance', totalCryptos).addField('Value', totalAmoun.toFixed(2) + ' $');

      msg.channel.send(embed);
    }

    if(msg.content.substr(0, 5) === '!help'){
      const embed = new Discord.MessageEmbed().setAuthor('Harry Stonks').setColor('0xFFFF00').setDescription(
        'Harry Cryptos is a bot that allows you to obtain information about different data of crypto world.\n\n' + '**Commands**\n' + '🗃  ' + '**!info:** <crypto you want to search>\n\n' 
        + '🛢  ' + '**!gasprice:** return gas cost of an ETH operation\n\n' + '⚖️  ' + '**!address:** <address you want to get info about>');

      msg.channel.send(embed);
    }
  
});


client.login(keys.DISCORD.key);