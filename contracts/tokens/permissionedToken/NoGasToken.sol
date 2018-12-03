pragma solidity ^0.4.24;

/**
* @title NoGasToken
* @notice Extends the permissioned token by providing functionality for users to interact with
* the permissioned token contract without needing to pay gas fees. NoGasToken will perform the 
* exact same actions as a normal PermissionedToken, but first it will validate a signature of the 
* hash of the parameters and ecrecover() a signature to prove the signer so everything is still 
* cryptographically backed. Then, instead of doing actions on behalf of msg.sender, 
* it will move the signer’s tokens. Finally, we can also wrap in a token reward to incentivise the relayer.
* @notice inspiration from @austingriffith and @PhABCD for leading the meta-transaction innovations
*/
contract NoGasToken is PermissionedToken {
    using SafeMath for uint256;

    /**
    * @dev create a new PermissionedToken with a brand new data storage
    **/
    constructor (address _regulator) PermissionedToken(_regulator) public {
    }

    /** Functions **/

    /**
    * @notice Remove CUSD from supply
    * @param _amount The number of tokens to burn
    * @return `true` if successful and `false` if unsuccessful
    */
    function metaBurn(uint256 _amount) userNotBlacklisted(msg.sender) public whenNotPaused {
        _burn(msg.sender, _amount);
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     * @notice increaseApproval should be used instead of approve when the user's allowance
     * is greater than 0. Using increaseApproval protects against potential double-spend attacks
     * by moving the check of whether the user has spent their allowance to the time that the transaction 
     * is mined, removing the user's ability to double-spend
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     */
    function metaIncreaseApproval(address _spender, uint256 _addedValue) 
    public userNotBlacklisted(_spender) userNotBlacklisted(msg.sender) whenNotPaused returns (bool) {
        _increaseApproval(_spender, _addedValue, msg.sender);
        return true;
    }

    /**
    * @notice Initiates a "send" operation towards another user. See `transferFrom` for details.
    * @param _to The address of the receiver. This user must not be blacklisted, or else the tranfer
    * will fail.
    * @param _amount The number of tokens to transfer
    *
    * @return `true` if successful 
    */
    function metaTransfer(address _to, uint256 _amount) public userNotBlacklisted(_to) userNotBlacklisted(msg.sender) whenNotPaused returns (bool) {
        require(_to != address(0),"to address cannot be 0x0");
        require(_amount <= balanceOf(msg.sender),"not enough balance to transfer");

        tokenStorage.subBalance(msg.sender, _amount);
        tokenStorage.addBalance(_to, _amount);
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function _increaseApproval(address _spender, uint256 _addedValue, address _tokenHolder) internal {
        tokenStorage.addAllowance(_tokenHolder, _spender, _addedValue);
        emit Approval(_tokenHolder, _spender, allowance(_tokenHolder, _spender));
    }

    function _burn(address _tokensOf, uint256 _amount) internal {
        require(_amount <= balanceOf(_tokensOf),"not enough balance to burn");
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure
        tokenStorage.subBalance(_tokensOf, _amount);
        tokenStorage.subTotalSupply(_amount);
        emit Burn(_tokensOf, _amount);
        emit Transfer(_tokensOf, address(0), _amount);
    }

}