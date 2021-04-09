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
`https://api.binance.com/api/v3/ticker/24hr?symbol=`, then you have to put your Binance API key in
the `X-MBX-APIKEY` field of the request header.

Now you are ready to start the bot, just type:
```
node run dev
```
Then you will see something like this:
```
> cryptocurrency-bot@1.0.0 dev <your dir here>
> npx nodemon

[nodemon] 2.0.7
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node index.js`
Logged as HarryCryptos#1178
```
If not, please open an issue and I will try to help you as soon as possible

## Commands 

At the moment the bot only have 4 options:

```
!help: return all the possible commands
!info: <crypto you want to search>
!gasprice: return gas cost of an ETH operation
!address: <wallet you want to get info about>
```

`!info <pair>` return actual price, how much the price change since the day before, the % of change,
the open price, highest price, lowest price and the volume of that crypto.

## Furure updates

The bot will be online 24/7 soon so stay tunned for updates.
