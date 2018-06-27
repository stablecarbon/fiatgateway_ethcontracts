/* Loading all libraries from common */
const {
  CreateRedeemToken, //CreateRedeem Token Contract
  BigNumber, //BigNumber from web3 (for ease to use)
  CommonVariables, //Multiple common variables
  expectRevert, //Check if the Solidity returns "revert" exception (usually result from require failed)
  ZERO_ADDRESS // 0x0000000000...
} = require('./helpers/common');


contract('CreateRedeemToken', _accounts => {
  const commonVars = new CommonVariables(_accounts);

  let accounts = commonVars.accounts;

  const _appOwner = commonVars.appOwner;
  const _tokenOwner = commonVars.tokenOwner;
  const _participants = commonVars.participants;

  let token = null;
  const initialFiatCredits = 1000;
  
  beforeEach(async () => {
    token = await CreateRedeemToken.new(_appOwner, initialFiatCredits, { from: _tokenOwner });
  });

  describe('as a basic CreateRedeemToken', function () {
    describe('after token creation', function () {
      it('sender should be token owner', async function () {
        const tokenOwner = await token.owner({ from: _appOwner});
        tokenOwner.should.equal(_tokenOwner);
      });
    });
  });

  describe('fiatCreditsOf', function () {
    
    describe('when the requested account has no credits', function () {
      it('returns zero', async function () {
          const credits = await token.fiatCreditsOf(_tokenOwner);
          assert.equal(credits, 0);
      });

    });

    describe('when the requested account has some credits', function () {
      it('returns the total amount of tokens', async function () {
          const credits = await token.fiatCreditsOf(_appOwner);
          assert.equal(credits, initialFiatCredits);
      });

    });
  });

  describe('addFiatCredits', function () {
    
    describe('when someone who is not the owner attempts to add credits', function () {
      
      it('reverts', async function () {
          await expectRevert(token.addFiatCredits(_appOwner, 500, {from : _appOwner }));
      });

    });

    describe('when the owner attempts to add credits', function () {
      
      it('credits the requested amount', async function () {
          await token.addFiatCredits(_appOwner, 500, {from : _tokenOwner });
          const credits = await token.fiatCreditsOf(_appOwner);
          assert.equal(credits, initialFiatCredits+500);
      });

      it('emits a DepositedFiatCredits event', async function () {
          const { logs } = await token.addFiatCredits(_appOwner, 500, {from : _tokenOwner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'DepositedFiatCredits');
          assert.equal(logs[0].args.to, _appOwner);
          assert(logs[0].args.amount.eq(500));
      });

    });

  });

  describe('create', function () {
    
    describe('when the sender does not have credits', function () {

      it('reverts', async function () {
          await expectRevert(token.create(100, { from: _tokenOwner }));
      })

    })

    describe('when the sender has credits', function () {

      describe('when the sender has enough credits to convert requested amount', function () {

        it('converts the requested amount of credits into tokens and increases token supply', async function () {
          await token.create(100, { from: _appOwner });

          // check that credits amount decreases
          const credits = await token.fiatCreditsOf(_appOwner);
          assert.equal(credits, initialFiatCredits-100);

          // check that token balance increases
          const balance = await token.balanceOf(_appOwner);
          assert.equal(balance, 100);

          // check that token supply increases
          const totalSupply = await token.totalSupply();
          assert.equal(totalSupply, 100);

        });

        it('emits ConvertedFiatCredits and Transfer events', async function () {
          const { logs } = await token.create(100, {from : _appOwner });

          assert.equal(logs.length, 2);
          assert.equal(logs[0].event, 'ConvertedFiatCredits');
          assert.equal(logs[0].args.to, _appOwner);
          assert(logs[0].args.amount.eq(100));
          assert.equal(logs[1].event, 'Transfer');
          assert.equal(logs[1].args.from, ZERO_ADDRESS);
          assert.equal(logs[1].args.to, _appOwner);
          assert(logs[1].args.value.eq(100));
        });

      });

      describe('when the sender attempts to convert more credits than they own', function () {

        it('reverts', async function () {
            await expectRevert(token.create(1100, { from: _appOwner }));
        });

      });
      
    });
  });

  describe('burn', function () {
    const amountOfTokens = 500;

    beforeEach(async function () {
        await token.create(amountOfTokens, { from: _appOwner });
    });

    describe('when the sender does not have tokens', function () {

      it('reverts', async function () {
          await expectRevert(token.burn(1, { from: _tokenOwner }));
      })

    })

    describe('when the sender has tokens', function () {

      describe('when the sender has enough tokens to redeem requested amount', function () {

        it('redeems the requested amount of tokens into fiatCredits and decreases token supply', async function () {
          await token.burn(100, { from: _appOwner });

          // check that credits amount increases
          const credits = await token.fiatCreditsOf(_appOwner);
          assert.equal(credits, initialFiatCredits-amountOfTokens+100);

          // check that token balance decreases
          const balance = await token.balanceOf(_appOwner);
          assert.equal(balance, amountOfTokens-100);

          // check that token supply decreases
          const totalSupply = await token.totalSupply();
          assert.equal(totalSupply, amountOfTokens-100);

        });

        it('emits RedeemedTokens and Transfer events', async function () {
          const { logs } = await token.burn(100, {from : _appOwner });

          assert.equal(logs.length, 2);
          assert.equal(logs[0].event, 'RedeemedTokens');
          assert.equal(logs[0].args.to, _appOwner);
          assert(logs[0].args.amount.eq(100));
          assert.equal(logs[1].event, 'Transfer');
          assert.equal(logs[1].args.from, _appOwner);
          assert.equal(logs[1].args.to, ZERO_ADDRESS);
          assert(logs[1].args.value.eq(100));
        });

      });

      describe('when the sender attempts to redeem more tokens than they own', function () {

        it('reverts', async function () {
            await expectRevert(token.burn(amountOfTokens+1, { from: _appOwner }));
        });

      });
      
    });
  });

});