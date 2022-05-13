const { default: config } = require('./config');
require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.4',
  networks: {
    rinkeby: {
      url: config.http_key,
      accounts: [config.wallet_key],
    },
  },
};
