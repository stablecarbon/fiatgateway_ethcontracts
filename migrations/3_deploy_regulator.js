var Regulator = artifacts.require("./Regulator");

module.exports = function(deployer, network, accounts) {
  let regulatorOwner = accounts[0];

  deployer.deploy(Regulator, { from: regulatorOwner })
};