var MetaFusionToken = artifacts.require("./ERC20_mtf_allowance.sol");
var MetaFusionSale = artifacts.require("./Second_sale.sol");

const moment = require('moment');

module.exports = async function(deployer, network, accounts) {

  var owner = accounts[0];
  var rate = new web3.BigNumber(10000000000); // 0.001 ETH * 5 decimals
  var startTime = moment().add(6, 'minutes').unix();
  var endTime = startTime + (133300); //+ 5 minutes
  var iconemy = accounts[3];

  var token = MetaFusionToken.deployed();

  deployer.deploy(MetaFusionSale, token.address, owner, rate, startTime, endTime, iconemy);
};