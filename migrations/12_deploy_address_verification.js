var AddressVerification = artifacts.require('AddressVerification');

module.exports = function(deployer) {
  deployer.deploy(AddressVerification);
};