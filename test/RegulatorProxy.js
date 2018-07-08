/* Loading all libraries from common */
const {
  PermissionedToken, 
  RegulatorProxy, 
  Regulator, 
  BigNumber,
  CommonVariables,
  expectRevert,
  assertBalance, 
  ZERO_ADDRESS 
} = require('./helpers/common');


contract('RegulatorProxy', _accounts => {
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

  describe('RegulatorProxy', function () {

    beforeEach(async () => {

      regulator = await Regulator.new( { from: _regulatorOwner } );
      regulatorProxy = await RegulatorProxy.new (regulator.address, { from: _regulatorProxyOwner } );
      token = await PermissionedToken.new(regulatorProxy.address, { from: _tokenOwner });

      // Make _regulatorOwner a validator to modify regulator state
      await regulator.addValidator(_regulatorOwner, {from: _regulatorOwner});

      // Initialize attributes of first regulator
      await regulator.setAttribute(_userSender, "whitelisted", 1, "can mint", {from: _regulatorOwner});

      // Create a replacement regulator with a different attribute state
      newRegulator = await Regulator.new( { from: _regulatorOwner2 } );
      // // Keep the regulator the same
      await newRegulator.addValidator(_regulatorOwner, {from: _regulatorOwner2});
      await newRegulator.setAttribute(_userSender, "blacklisted", 1, "frozen", {from: _regulatorOwner});
    
    });

    describe('after smart contract creation', function () {
      it('owner should be regulator proxy owner', async function () {
        const regulatorProxyOwner = await regulatorProxy.owner();
        regulatorProxyOwner.should.equal(_regulatorProxyOwner);
      });
    });

    describe('replaceService', function () {
      
      beforeEach(async () => {
        
        const currentRegulator = await regulatorProxy.regulator();
        assert.equal(currentRegulator, regulator.address);

      });

      describe('owner replaces the regulator service with a valid address', function () {

        it('replaces the regulator address', async function () {

          const {logs} = await regulatorProxy.replaceService(newRegulator.address, {from: _regulatorProxyOwner});
          const replacementRegulator = await regulatorProxy.regulator();
          assert.equal(replacementRegulator, newRegulator.address);

          // Check that event was emitted
          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'ReplaceRegulator');
          assert.equal(logs[0].args.oldRegulator, regulator.address);
          assert.equal(logs[0].args.newRegulator, newRegulator.address);

        });

      });

      describe('owner replaces the regulator service with an invalid address', function () {

        it('reverts', async function () {
          
          await expectRevert(regulatorProxy.replaceService(_userSender, {from: _regulatorProxyOwner}));
          await expectRevert(regulatorProxy.replaceService(0, {from: _regulatorProxyOwner}));

          // State shouldn't change
          const currentRegulator = await regulatorProxy.regulator();
          assert.equal(currentRegulator, regulator.address);

        });

      });

      describe('non-owner replaces the regulator service', function () {

        it('reverts', async function () {

          await expectRevert(regulatorProxy.replaceService(newRegulator.address, {from: _attacker}));

          // State shouldn't change
          const currentRegulator = await regulatorProxy.regulator();
          assert.equal(currentRegulator, regulator.address);

        });

      });

    });

    describe('hasAttribute', function () {

      describe('owner replaces the regulator service with a different valid regulator', function () {

        it('replaces regulator and attribute state', async function () {

          assert(await regulatorProxy.hasAttribute(_userSender, "whitelisted"));
          assert(! await regulatorProxy.hasAttribute(_userSender, "blacklisted"));
          await regulatorProxy.replaceService(newRegulator.address, {from: _regulatorProxyOwner});
          assert(await regulatorProxy.hasAttribute(_userSender, "blacklisted"));
          assert(! await regulatorProxy.hasAttribute(_userSender, "whitelisted"));

        });

      });

    });

  });

});