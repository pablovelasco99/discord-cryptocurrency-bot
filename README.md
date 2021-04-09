# Harry Cryptos Bot for Discord

Harry is a bot that provides you real time information about any cryptocurrency.
Users of your Server will be able to find information about all cryptos, search the content
from a wallet or have information about the price of ETH transactions. 

## Bot Setup
To start make sure you have installed the latest version of NodeJS. After that, download this
repository, open a terminal and go to the download location. Then run:

```
npm install
```

After that you have to put in `requestRealTimeData` function of `API.js` the Binance url like
`https://api.binance.com/api/v3/ticker/24hr?symbol=`, then you have to put yout Binance API key in
the file `X-MBX-APIKEY` field of the request header.

Now you are ready to start the bot, just type:
```
node run dev
```

## Commands 

At the moment the bot only have 4 options:

```
!help: return all the possible commands
!info: <crypto you want to search>
!gasprice: return gas cost of an ETH operation
!address: <wallet you want to get info about>
```

`!info <pair>` return: actual price, how much the price change since the day before, the % of change,
the open price, highest price, lowest price and the volume of that crypto.


