

function permissionedTokenTests() {
    describe("Permissioned Token Tests", function () {
        describe('mint', function () {
            describe('when sender is minter', function () {
                it('mints to user', function () {
                    
                });
            });
            describe('when sender is not minter', function () {
                it('reverts mint call', function () {
                    
                });
            });
        });
        describe('burn', function () {
            describe('when sender is whitelisted', function () {
                it('mints to user', function () {

                });
            });
            describe('when sender is not whitelisted', function () {
                describe('when sender is blacklisted', function () {
                    it('reverts call', function () {

                    });
                });
                describe('when sender is nonlisted', function () {
                    it('reverts call', function () {

                    });
                });
            });
        });
        describe('transfer', function () {
            describe('when recipient is not blacklisted and funds are plenty', function () {
                it('transfer is completed', function () {

                });
            });
            describe('when recipient is blacklisted', function () {
                it('transfer is reverted', function () {

                });
            });
        });
        describe('transferFrom', function () {
            describe('sender and recipient are not blacklisted and funds are plenty', function () {
                it('transfer succeeds', function () {

                });
            });
            describe('sender is blacklisted but transfer initiator is an approved blacklist spender with enough allowance (and funds are plenty)', function () {
                it('transfer succeeds', function () {

                });
            });
            describe('sender is blacklisted and transfer initiator is not an approved blacklist spender (but funds are still plenty)', function () {
                it('reverts call', function () {

                });
            });
        });
        describe('destroyBlacklistedTokens', function () {
            describe('sender has the ability to destroy tokens from blacklisted accounts', function () {
                it('tokens are destroyed', function () {
                    
                });
            });
            describe('sender does not have the ability to destroy tokens from blacklisted accounts', function () {
                it('reverts call', function () {
                    
                });
            });
        });
        describe('addBlacklistedAddressSpender', function () {
            describe('sender has the ability to add themselves as a spender on blacklisted accounts', function () {
                it('sender is added as a spender', function () {

                });
            });
            describe('sender does not have the ability to add themselves as a spender on blacklisted accounts', function () {
                it('reverts call', function () {

                });
            });
        });
        describe('blacklisted', function () {
            describe('user that is blacklisted calls function', function () {
                it('call succeeds', function () {
                    
                });
            });
            describe('user that is not blacklisted calls function', function () {
                it('call reverts', function () {

                });
            });
        });
    });
}

module.exports = {
    permissionedTokenTests
}