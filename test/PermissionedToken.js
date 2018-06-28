/* Loading all libraries from common */
const {
  PermissionedToken, //Permissioned Token Contract
  ServiceRegistry, //Service Registry Contract
  RegulatorService, //Regulator Service Contract
  BigNumber, //BigNumber from web3 (for ease to use)
  CommonVariables, //Multiple common variables
  expectRevert, //Check if the Solidity returns "revert" exception (usually result from require failed)
  ZERO_ADDRESS // 0x0000000000...
} = require('./helpers/common');


contract('PermissionedToken', _accounts => {
  const commonVars = new CommonVariables(_accounts);

  let accounts = commonVars.accounts;

  const _appOwner = commonVars.appOwner;
  const _tokenOwner = commonVars.tokenOwner;
  const _participants = commonVars.participants;

  let token = null;
  let serviceRegistry = null;
  let regulatorService = null;
  const initialBalance = 1000;
  
  beforeEach(async () => {
    
    token = await PermissionedToken.new(_appOwner, initialBalance, { from: _tokenOwner });
  });

  describe('as a basic PermissionedToken', function () {
    describe('after token creation', function () {
      it('sender should be token owner', async function () {
        const tokenOwner = await token.owner({ from: _appOwner});
        tokenOwner.should.equal(_tokenOwner);
      });
    });
  });

  describe('setRegistry', function () {
    describe('owner sets registry', function () {
      it('sets registry for token smart contract', async function () {

      });
    });

    describe('non-owner sets registry', function () {
      it('reverts', async function () {

      });
    });

  })

});