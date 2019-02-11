pragma solidity ^0.4.24;

import "./PermissionedToken.sol";

/**
* @title MetaToken
* @notice Extends the PermissionedToken token by providing functionality for users to interact with
* the permissioned token contract without needing to pay gas fees. MetaToken will perform the 
* exact same actions as a normal CarbonDollar, but first it will validate a signature of the 
* hash of the parameters and ecrecover() a signature to prove the signer so everything is still 
* cryptographically backed. Then, instead of doing actions on behalf of msg.sender, 
* it will move the signer’s tokens. Finally, we can also wrap in a token reward to incentivise the relayer.
* @notice inspiration from @austingriffith and @PhABCD for leading the meta-transaction innovations
*/
contract MetaToken is PermissionedToken {

    /**
    * @dev create a new CarbonDollar with a brand new data storage
    **/
    constructor (address _regulator) PermissionedToken(_regulator) public {
    }

    /**
        Storage
    */
    mapping (address => uint256) public replayNonce;

    /** 
        ERC20 Metadata
    */
    string public constant name = "CUSD";
    string public constant symbol = "CUSD";
    uint8 public constant decimals = 18;


    /** Functions **/

    /**
    * @dev Verify and broadcast an increaseApproval() signed metatransaction. The msg.sender or "relayer"
    *           will pay for the ETH gas fees since they are sending this transaction, and in exchange
    *           the "signer" will pay CUSD to the relayer.
    * @notice increaseApproval should be used instead of approve when the user's allowance
    * is greater than 0. Using increaseApproval protects against potential double-spend attacks
    * by moving the check of whether the user has spent their allowance to the time that the transaction 
    * is mined, removing the user's ability to double-spend
    * @param _spender The address which will spend the funds.
    * @param _addedValue The amount of tokens to increase the allowance by.
    * @param _signature the metatransaction signature, which metaTransfer verifies is signed by the original transfer() sender
    * @param _nonce to prevent replay attack of metatransactions
    * @param _reward amount of CUSD to pay relayer in
    * @return `true` if successful 
     */
    function metaIncreaseApproval(address _spender, uint256 _addedValue, bytes _signature, uint256 _nonce, uint256 _reward) 
    public userNotBlacklisted(_spender) whenNotPaused returns (bool) {
        bytes32 metaHash = metaApproveHash(_spender, _addedValue, _nonce, _reward);
        address signer = _getSigner(metaHash, _signature);
        require(!regulator.isBlacklistedUser(signer), "signer is blacklisted");
        require(_nonce == replayNonce[signer], "this transaction has already been broadcast");
        replayNonce[signer]++;

        require( _reward > 0, "reward to incentivize relayer must be positive");
        require( _reward <= balanceOf(signer),"not enough balance to reward relayer");
        _increaseApproval(_spender, _addedValue, signer);
        _transfer(msg.sender, signer, _reward);
        return true;
    }

    /**
    * @notice Verify and broadcast a transfer() signed metatransaction. The msg.sender or "relayer"
    *           will pay for the ETH gas fees since they are sending this transaction, and in exchange
    *           the "signer" will pay CUSD to the relayer.
    * @param _to The address of the receiver. This user must not be blacklisted, or else the transfer
    * will fail.
    * @param _amount The number of tokens to transfer
    * @param _signature the metatransaction signature, which metaTransfer verifies is signed by the original transfer() sender
    * @param _nonce to prevent replay attack of metatransactions
    * @param _reward amount of CUSD to pay relayer in
    * @return `true` if successful 
    */
    function metaTransfer(address _to, uint256 _amount, bytes _signature, uint256 _nonce, uint256 _reward) public userNotBlacklisted(_to) whenNotPaused returns (bool) {
        bytes32 metaHash = metaTransferHash(_to, _amount, _nonce, _reward);
        address signer = _getSigner(metaHash, _signature);
        require(!regulator.isBlacklistedUser(signer), "signer is blacklisted");
        require(_nonce == replayNonce[signer], "this transaction has already been broadcast");
        replayNonce[signer]++;

        require( _reward > 0, "reward to incentivize relayer must be positive");
        require( (_amount + _reward) <= balanceOf(signer),"not enough balance to transfer and reward relayer");
        _transfer(_to, signer, _amount);
        _transfer(msg.sender, signer, _reward);
        return true;
    }

    /**
    * @notice Verify and broadcast a burnCarbonDollar() signed metatransaction. The msg.sender or "relayer"
    *           will pay for the ETH gas fees since they are sending this transaction, and in exchange
    *           the "signer" will pay CUSD to the relayer.
    * @param _amount The number of tokens to transfer
    * @param _signature the metatransaction signature, which metaTransfer verifies is signed by the original transfer() sender
    * @param _nonce to prevent replay attack of metatransactions
    * @param _reward amount of CUSD to pay relayer in
    * @return `true` if successful 
    */
    function metaBurn(uint256 _amount, bytes _signature, uint256 _nonce, uint256 _reward) public whenNotPaused returns (bool) {
        bytes32 metaHash = metaBurnHash(_amount, _nonce, _reward);
        address signer = _getSigner(metaHash, _signature);
        require(!regulator.isBlacklistedUser(signer), "signer is blacklisted");
        require(_nonce == replayNonce[signer], "this transaction has already been broadcast");
        replayNonce[signer]++;

        require( _reward > 0, "reward to incentivize relayer must be positive");
        require( (_amount + _reward) <= balanceOf(signer),"not enough balance to burn and reward relayer");
        _burn(signer, _amount);
        _transfer(msg.sender, signer, _reward);
        return true;
    }

    /**
    * @notice Return hash containing all of the information about the transfer() metatransaction
    * @param _to The address of the transfer receiver
    * @param _amount The number of tokens to transfer
    * @param _nonce to prevent replay attack of metatransactions
    * @param _reward amount of CUSD to pay relayer in
    * @return bytes32 hash of metatransaction
    */
    function metaTransferHash(address _to, uint256 _amount, uint256 _nonce, uint256 _reward) public view returns(bytes32){
        return keccak256(abi.encodePacked(address(this),"metaTransfer", _to, _amount, _nonce, _reward));
    }

    /**
    * @notice Return hash containing all of the information about the increaseApproval() metatransaction
    * @param _spender The address which will spend the funds.
    * @param _addedValue The amount of tokens to increase the allowance by.
    * @param _nonce to prevent replay attack of metatransactions
    * @param _reward amount of CUSD to pay relayer in
    * @return bytes32 hash of metatransaction
    */
    function metaApproveHash(address _spender, uint256 _addedValue, uint256 _nonce, uint256 _reward) public view returns(bytes32){
        return keccak256(abi.encodePacked(address(this),"metaIncreaseApproval", _spender, _addedValue, _nonce, _reward));
    }

    /**
    * @notice Return hash containing all of the information about the burn() metatransaction
    * @param _amount The number of tokens to burn
    * @param _nonce to prevent replay attack of metatransactions
    * @param _reward amount of CUSD to pay relayer in
    * @return bytes32 hash of metatransaction
    */
    function metaBurnHash(uint256 _amount, uint256 _nonce, uint256 _reward) public view returns(bytes32){
        return keccak256(abi.encodePacked(address(this),"metaBurn", _amount, _nonce, _reward));
    }

    /**
    * @dev Recover signer of original metatransaction 
    * @param _hash derived bytes32 metatransaction signature, which should be the same as the parameter _signature
    * @param _signature bytes metatransaction signature, the signature is generated using web3.eth.sign()
    * @return address of hash signer
    */
    function _getSigner(bytes32 _hash, bytes _signature) internal pure returns (address){
        bytes32 r;
        bytes32 s;
        uint8 v;
        if (_signature.length != 65) {
            return address(0);
        }
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
        if (v < 27) {
            v += 27;
        }
        if (v != 27 && v != 28) {
            return address(0);
        } else {
            return ecrecover(keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)
            ), v, r, s);
        }
    }

}