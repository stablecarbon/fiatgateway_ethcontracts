/* Loading all libraries from common */
const {
  RegulatorService, //Regulator Service Contract
  ServiceRegistry, //Service Registry Contract
  BigNumber, //BigNumber from web3 (for ease to use)
  CommonVariables, //Multiple common variables
  expectRevert, //Check if the Solidity returns "revert" exception (usually result from require failed)
  ZERO_ADDRESS // 0x0000000000...
} = require('./helpers/common');

contract('ServiceRegistry', _accounts => {
  const commonVars = new CommonVariables(_accounts);

  let accounts = commonVars.accounts;

  const _appOwner = commonVars.appOwner;
  const _tokenOwner = commonVars.tokenOwner;
  const _participants = commonVars.participants;

  let regulatorService = null;
  let serviceRegistry = null;

  beforeEach(async () => {
    regulatorService = await RegulatorService.new({ from: _appOwner });
    serviceRegistry = await ServiceRegistry.new({ from: _appOwner });
  });

  describe('as a basic ServiceRegistry', function () {
    describe('after service registry creation', function () {
      it('sender should be owner', async function () {
        const owner = await serviceRegistry.owner({ from: _appOwner});
        owner.should.equal(_appOwner);
      });
    });
  });

  describe('replaceService', function () {

    describe('owner replaces regulator service first time', function () {

		it('sets new registry', async function () {
			// TODO
			// await serviceRegistry.replaceService(regulatorService.address, { from: _appOwner });
			// assert.equal(regulatorService.address, serviceRegistry.service);
		});

	});

	describe('owner replaces regulator service', function () {

		it('replaces registry', async function () {
			// TODO
		});

	});

	describe('non-owner replaces regulator service', function () {

		it('reverts', async function () {
			await expectRevert(serviceRegistry.replaceService(regulatorService.address, { from: _tokenOwner }));
		});

	});


  });

});