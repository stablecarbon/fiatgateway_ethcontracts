var CarbonDollarRegulator = artifacts.require("./CarbonDollarRegulator");

// Deploy a new CD regulator using new Permission and Validator sheet instances
module.exports = function(deployer, network, accounts) {
  let cdRegulatorOwner = accounts[0];
  const ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;

  deployer.deploy(CarbonDollarRegulator, ZERO_ADDRESS, ZERO_ADDRESS, {from:cdRegulatorOwner})
};
