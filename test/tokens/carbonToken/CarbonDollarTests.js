function carbonDollarTests() {
    describe('Fee sheet interactions', function () {
        describe('when sender is owner', function () {
            describe('setFeeSheet', function () {
                it('sets fee sheet', function () {
                    
                });
                it('emits fee sheet changed event', function () {
                    
                });
            });
            describe('setFee', function () {
                it('sets fee for a stablecoin', function () {

                });
            });
            describe('setDefaultFee', function () {
                it('sets default fee', function () {

                });
            });
        });
        describe('when sender is not owner', function () {
            it('reverts all calls', function () {
                
            });
        });
    });
    describe('Stablecoin whitelist interactions', function () {
        describe('when sender is owner', function () {
            describe('setStablecoinWhitelist', function () {
                it('sets stablecoin whitelist sheet', function () {

                });
                it('emits stablecoin whitelist changed event', function () {

                });
            });
            describe('listToken', function () {
                it('adds stablecoin to whitelist', function () {

                });
            });
            describe('unlistToken', function () {
                it('removes stablecoin from whitelist', function () {

                });
            });
        });
        describe('when sender is not owner', function () {
            it('reverts all calls', function () {

            });
        });
    });
    describe('mintCarbonDollar', function () {
        describe('when sender is a token contract', function () {
            it('tokens are minted', function () {
                
            });
        });
        describe('when sender is a token contract but is not whitelisted', function () {
            it('reverts call', function () {
                
            });
        });
        describe('when sender is not a token contract', function () {
            it('reverts call', function () {

            });
        });
    });
    describe('burnCarbonDollar', function () {
        describe('', function () {
            
        });
    });
    // Burns CUSD with appropriately charged fee (and deposits fee into Carbon Labs account)
}

module.exports = {
    carbonDollarTests
}