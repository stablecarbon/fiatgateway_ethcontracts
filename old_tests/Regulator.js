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


contract('Regulator', _accounts => {
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

  describe('Regulator', function () {

    beforeEach(async () => {

      regulator = await Regulator.new( { from: _regulatorOwner } );
      regulatorProxy = await RegulatorProxy.new (regulator.address, { from: _regulatorProxyOwner } );
      token = await PermissionedToken.new(regulatorProxy.address, { from: _tokenOwner });
    
    });

    describe('after smart contract creation', function () {
      it('owner should be regulator owner', async function () {
        const regulatorOwner = await regulator.owner();
        regulatorOwner.should.equal(_regulatorOwner);
      });
    });

    describe('addValidator', function () {
      
      describe('regulator owner adds regulator owner as validator', function () {
        it('regulator owner should be a validator', async function () {
          
          (await regulator.isValidator(_regulatorOwner)).should.not.be.true;
          await regulator.addValidator(_regulatorOwner, {from: _regulatorOwner});
          (await regulator.isValidator(_regulatorOwner)).should.be.true;
        
        });
        it('emits ValidatorAdded event', async function () {
          const {logs} = await regulator.addValidator(_regulatorOwner, {from: _regulatorOwner});
          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'ValidatorAdded');
          assert.equal(logs[0].args.validator, _regulatorOwner);
        });
      });

      describe('attacker adds regulator owner as validator', function () {
        it('reverts', async function() {
          await expectRevert(regulator.addValidator(_regulatorOwner, {from: _attacker}));
        });
      });
      
    });

    describe('removeValidator', function () {

      describe('regulator owner removes regulator owner as validator', function () {
        it('regulator owner should not be a validator', async function () {
          await regulator.addValidator(_regulatorOwner, {from: _regulatorOwner});
          (await regulator.isValidator(_regulatorOwner)).should.be.true;
          await regulator.removeValidator(_regulatorOwner, {from:_regulatorOwner});
          (await regulator.isValidator(_regulatorOwner)).should.not.be.true;
        });
        it('emits ValidatorRemoved event', async function () {
          const {logs} = await regulator.removeValidator(_regulatorOwner, {from: _regulatorOwner});
          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'ValidatorRemoved');
          assert.equal(logs[0].args.validator, _regulatorOwner);
        });
      });

      describe('attacker removes regulator owner as regulator', function () {
        it('reverts', async function() {
          await regulator.addValidator(_regulatorOwner, {from: _regulatorOwner})
          await expectRevert(regulator.removeValidator(_regulatorOwner, {from: _attacker}));
        });
      });

    });

    describe('setAttribute', function () {

      beforeEach(async () => {

        await regulator.addValidator(_regulatorOwner, {from: _regulatorOwner});

      });

      describe('validator sets attribute', function () {

        it('sets attribute successfully', async function () {

          (await regulator.hasAttribute(_userSender, "whitelisted")).should.not.be.true;
          await regulator.setAttribute(_userSender, "whitelisted", 1, "can mint", {from: _regulatorOwner});
          (await regulator.hasAttribute(_userSender, "whitelisted")).should.be.true;

        });

        it('emits SetAttribute event', async function () {

          const {logs} = await regulator.setAttribute(_userSender, "whitelisted", 1, "can mint", {from: _regulatorOwner});
          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, "SetAttribute");
          assert.equal(logs[0].args.who, _userSender);
          assert.equal(logs[0].args.attribute, "whitelisted");
          assert.equal(logs[0].args.value, 1);
          assert.equal(logs[0].args.notes, "can mint");
          assert.equal(logs[0].args.adminAddr, _regulatorOwner);
          assert.equal(logs[0].args.timestamp, web3.eth.getBlock(logs[0].blockNumber).timestamp);
        });

      });

      describe('non-validator sets attribute', function () {

        it('reverts', async function () {

          await expectRevert(regulator.setAttribute(_userSender, "whitelisted", 1, "can mint", {from: _attacker}));

        });

      });

    });


    describe('getAttribute', function () {

      beforeEach(async () => {

        await regulator.addValidator(_regulatorOwner, {from: _regulatorOwner});

      });

      describe('validator gets attribute', function () {

        it('gets attribute successfully', async function () {

          (await regulator.hasAttribute(_userSender, "whitelisted")).should.not.be.true;
          const {receipt} = await regulator.setAttribute(_userSender, "whitelisted", 1, "can mint", {from: _regulatorOwner});
          [value, notes, admin, timestamp] = await regulator.getAttribute(_userSender, "whitelisted");
          assert.equal(value, 1);
          assert.equal(notes, "can mint");
          assert.equal(admin, _regulatorOwner);
          assert.equal(timestamp, web3.eth.getBlock(receipt.blockNumber).timestamp);

        });

      });

    });

  });

});