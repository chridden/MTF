var MetaFusionToken = artifacts.require("./ERC20_mtf_allowance.sol");
var MetaFusionSale = artifacts.require("./SALE_mtf.sol");

const moment = require('moment');

module.exports = async function(deployer, network, accounts) {
  var name = 'MetaFusion';
  var symbol = 'MTF';
  var decimals = 5;	
  var amount = 10000000000000; //100 million * 5 decimals
  var owner = accounts[0];
  var rate = new web3.BigNumber(10000000000); // 0.001 ETH * 5 decimals
  var startTime = moment().add(1, 'minutes').unix();
  var endTime = startTime + (300); //+ 5 minutes
  var iconemy = accounts[3];

  deployer.deploy(MetaFusionToken, amount, name, decimals, symbol, owner).then(function() {
     return deployer.deploy(MetaFusionSale, MetaFusionToken.address, owner, rate, startTime, endTime, iconemy);
  });
};