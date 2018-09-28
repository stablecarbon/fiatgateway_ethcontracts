var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, accounts) {
  let owner = accounts[0];
  console.log('deploying contracts from: ' + owner)

  deployer.deploy(Migrations);
};
