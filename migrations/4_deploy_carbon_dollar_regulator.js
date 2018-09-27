var CarbonDollarRegulator = artifacts.require("./CarbonDollarRegulator");

// Deploy a new CD regulator using new Permission and Validator sheet instances
module.exports = function(deployer, network, accounts) {
  let cdRegulatorOwner = accounts[0];

  // deployer.deploy(CarbonDollarRegulator, {from:cdRegulatorOwner})
};
