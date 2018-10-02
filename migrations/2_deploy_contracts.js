var ConvertLib = artifacts.require('./ConvertLib.sol')
var Metafusion = artifacts.require('./Metafusion.sol')

module.exports = function (deployer) {
  deployer.deploy(ConvertLib)
  deployer.link(ConvertLib, Metafusion)
  deployer.deploy(Metafusion)
}
