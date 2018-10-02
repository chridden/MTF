var MetaFusion = artifacts.require("./MetaFusion.sol");

module.exports = async function(deployer, network, accounts) {
  var name = MetaFusion;
  var symbol = MTF;
  var decimals = 5;	

  return deployer.deploy(MetaFusion, name, symbol, decimals, {overwrite: false});
};