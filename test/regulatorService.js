/* Loading all libraries from common */
const {
  RegulatorService, //Regulator Service Contract
  BigNumber, //BigNumber from web3 (for ease to use)
  CommonVariables, //Multiple common variables
  expectRevert, //Check if the Solidity returns "revert" exception (usually result from require failed)
  ZERO_ADDRESS // 0x0000000000...
} = require('./helpers/common');

contract('RegulatorService', _accounts => {
  const commonVars = new CommonVariables(_accounts);

  let accounts = commonVars.accounts;

  const _appOwner = commonVars.appOwner;
  const _tokenOwner = commonVars.tokenOwner;
  const _participants = commonVars.participants;

  let regulatorService = null;

  beforeEach(async () => {
    regulatorService = await RegulatorService.new({ from: _appOwner });
  });

  describe('as a basic RegulatorService', function () {
    describe('after regulator service creation', function () {
      it('sender should be owner', async function () {
        const owner = await regulatorService.owner({ from: _appOwner});
        owner.should.equal(_appOwner);
      });
    });
  });

  describe('setAttribute and hasAttribute', function () {

  	const attribute = "KYC";
  	const value = 1;
  	const notes = "know your customer";

  	const attribute2 = "AML";
  	const value2 = 0;
  	const notes2 = "anti-money laundering";

    describe('owner sets attribute true', async function () {

		it('sets attribute properly', async function () {
			await regulatorService.setAttribute(_tokenOwner, attribute, value, notes, { from: _appOwner });
			hasAttribute = await regulatorService.hasAttribute(_tokenOwner, attribute);
			assert.equal(hasAttribute, 1);
		});

		it('does not set any other attributes', async function () {
			await regulatorService.setAttribute(_tokenOwner, attribute, value, notes, { from: _appOwner });
			hasAttribute = await regulatorService.hasAttribute(_tokenOwner, attribute2);
			assert.equal(hasAttribute, 0);
		});

		it('emits a SetAttribute event', async function () {
			const { logs } = await regulatorService.setAttribute(_tokenOwner, attribute, value, notes, { from: _appOwner });
			assert.equal(logs.length, 1);
			assert.equal(logs[0].event, 'SetAttribute');
			assert.equal(logs[0].args.who, _tokenOwner);
			assert.equal(logs[0].args.attribute, attribute);
			assert.equal(logs[0].args.value, value);
			assert.equal(logs[0].args.notes, notes);
			assert.equal(logs[0].args.adminAddr, _appOwner);
		});

	});

	describe('owner sets attribute false after setting true', async function () {
		it('reads attribute as false', async function () {
			await regulatorService.setAttribute(_tokenOwner, attribute, value, notes, { from: _appOwner });
			await regulatorService.setAttribute(_tokenOwner, attribute, value2, notes, { from: _appOwner });
			hasAttribute = await regulatorService.hasAttribute(_tokenOwner, attribute);
			assert.equal(hasAttribute, 0);
		})
	});

	describe('owner sets attribute false from the start', async function () {
		it('reads attribute as false', async function () {
			await regulatorService.setAttribute(_tokenOwner, attribute2, value2, notes2, { from: _appOwner });
			hasAttribute = await regulatorService.hasAttribute(_tokenOwner, attribute2);
			assert.equal(hasAttribute, 0);
		})
	});

    describe('non-owner sets attribute', function () {
    	it('reverts', async function() {
    		await expectRevert(regulatorService.setAttribute(_tokenOwner, attribute, value, notes, { from: _tokenOwner }));
    	});
    });

  });

});