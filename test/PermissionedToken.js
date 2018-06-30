/* Loading all libraries from common */
const {
  PermissionedToken, 
  RegulatorProxy, 
  Regulator, 
  BigNumber,
  CommonVariables,
  expectRevert, 
  ZERO_ADDRESS 
} = require('./helpers/common');


contract('PermissionedToken', _accounts => {
  const commonVars = new CommonVariables(_accounts);

  let accounts = commonVars.accounts;

  // The test players:
  const _appOwner = commonVars.appOwner;
  const _tokenOwner = commonVars.tokenOwner;
  const _regulatorOwner = commonVars.regulatorOwner;
  const _regulatorProxyOwner = commonVars.regulatorProxyOwner;
  const _regulatorOwner2 = commonVars.regulatorOwner2;
  const _attacker = commonVars.attacker;
  const _userSender = commonVars.userSender;
  const _userReceiver = commonVars.userReceiver;

  // Constant values
  let regulator = null;
  let regulatorProxy = null;
  let token = null;
  
  beforeEach(async () => {
    regulator = await Regulator.new( { from: _regulatorOwner } );
    regulatorProxy = await RegulatorProxy.new (regulator.address, { from: _regulatorProxyOwner } );
    token = await PermissionedToken.new(regulatorProxy.address, { from: _tokenOwner });
  });

  describe('PermissionedToken', function () {
    
    describe('after smart contract creation', function () {
      it('owner should be token owner', async function () {
        const tokenOwner = await token.owner();
        tokenOwner.should.equal(_tokenOwner);
      });
    });

    describe('addDepositor', function () {
      describe('token owner adds token owner as depositor', function () {
        it('token owner should have deposit access', async function () {
          await token.addDepositor(_tokenOwner, {from: _tokenOwner});
          (await token.isDepositor(_tokenOwner)).should.be.true;
        });
        it('emits DepositorAdded event', async function () {
          const {logs} = await token.addDepositor(_tokenOwner, {from: _tokenOwner});
          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'DepositorAdded');
          assert.equal(logs[0].args.depositor, _tokenOwner);
        });
      });

      describe('attacker adds token owner as depositor', function () {
        it('reverts', async function() {
          await expectRevert(token.addDepositor(_tokenOwner, {from: _attacker}));
        });
      });
      
    });

    describe('removeDepositor', function () {
      describe('token owner removes token owner as depositor', function () {
        it('token owner should not have deposit access', async function () {
          await token.addDepositor(_tokenOwner, {from: _tokenOwner});
          await token.removeDepositor(_tokenOwner, {from:_tokenOwner});
          (await token.isDepositor(_tokenOwner)).should.not.be.true;
        });
        it('emits DepositorRemoved event', async function () {
          const {logs} = await token.removeDepositor(_tokenOwner, {from: _tokenOwner});
          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'DepositorRemoved');
          assert.equal(logs[0].args.depositor, _tokenOwner);
        });
      });

      describe('attacker removes token owner as depositor', function () {
        it('reverts', async function() {
          await token.addDepositor(_tokenOwner, {from: _tokenOwner})
          await expectRevert(token.removeDepositor(_tokenOwner, {from: _attacker}));
        });
      });

    });

    describe('check', function () {
      
      beforeEach(async () => {
        // Make userReceiver the initial account with burn access
        await token.addDepositor(userReceiver, {from: _tokenOwner});
      });

      describe('mint', function () {

      });
      
      describe('transfer', function () {

      });
      
      describe('burn', function () {

      });

    });

  });

  describe('Regulator', function () {
    describe('after smart contract creation', function () {
      it('owner should be regulator owner', async function () {
        const regulatorOwner = await regulator.owner();
        regulatorOwner.should.equal(_regulatorOwner);
      });
    });
  });

  describe('RegulatorProxy', function () {
    describe('after smart contract creation', function () {
      it('owner should be regulator proxy owner', async function () {
        const regulatorProxyOwner = await regulatorProxy.owner();
        regulatorProxyOwner.should.equal(_regulatorProxyOwner);
      });
    });
  });

});