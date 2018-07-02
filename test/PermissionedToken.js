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
        await token.addDepositor(_tokenOwner, {from: _tokenOwner});
        
        // Add permissions for testing
        await regulator.addValidator(_regulatorOwner, {from: _regulatorOwner});
        await regulator.setAttribute(_userSender, "whitelist", 1, "can mint", {from: _regulatorOwner});
        await regulator.setAttribute(_userReceiver, "whitelist", 1, "can mint", {from: _regulatorOwner});
      });

      describe('mint', function () {
        
        describe('owner tries to mint to whitelisted account', function () {
          it('should mint to account', async function () {
            await token.mint(_userSender, 100, {from: _tokenOwner});
            assert.equal(await token.balanceOf(_userSender), 100);
          });
        });

        describe('owner tries to mint to unauthorized account', function () {
          it('reverts', async function () {
            await expectRevert(token.mint(_attacker, 100, {from: _tokenOwner}));
          });

        });

        describe('non-owner tries to mint to whitelisted account', function () {
          it('reverts', async function () {
            await expectRevert(token.mint(_userSender, 100, {from: _userSender}));
          });
        });
      });
      
      describe('transfer', function () {

      });
      
      describe('_burn', function () {

        beforeEach(async () => {
          // Mint tokens to a depositor account
          await token.addDepositor(_userSender, {from: _tokenOwner});
          await token.mint(_userSender, 100, {from: _tokenOwner});

          // Mint tokens to a non-depositor whitelisted account
          await token.mint(_userReceiver, 100, {from: _tokenOwner});
        });

        describe('authorized depositor tries to burn', function () {
          it('should burn depositor tokens', async function () {
            await token._burn(100, {from: _userSender});
            assert.equal(await token.balanceOf(_userSender), 0);
          });
        });

        describe('unauthorized whitelisted depositor tries to burn', function () {
          it('reverts', async function () {
            await expectRevert(token._burn(100, {from: _userReceiver}));
          });
        });

        describe('unauthorized non-whitelisted depositor trues to burn', function () {
          it('reverts', async function () {
            await regulator.setAttribute(_userSender, "whitelist", 0, "can no longer mint", {from: _regulatorOwner});
            await expectRevert(token._burn(100, {from: _userSender}));
          });
        });

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