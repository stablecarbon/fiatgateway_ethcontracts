var WhitelistedTokenRegulator = artifacts.require("./WhitelistedTokenRegulator");

// Deploy a new WT regulator using new Permission and Validator sheet instances
module.exports = function(deployer, network, accounts) {
  let wtRegulatorOwner = accounts[0];
  const ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;

  deployer.deploy(WhitelistedTokenRegulator, ZERO_ADDRESS, ZERO_ADDRESS, { from: wtRegulatorOwner })
};