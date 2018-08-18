pragma solidity ^0.4.24;

import '../../../helpers/Ownable.sol';

/**
* @title StablecoinWhitelist
* @notice Contains a mapping indicating whether or not a token contract
* is approved to participate on the CarbonUSD network. We can also refer
* to tokens on the whitelist as "stablecoins".
*/
contract StablecoinWhitelist is Ownable {
    /** 
        Mappings
    */

    /* is the token address referring to a stablecoin/whitelisted token? */
    mapping (address => bool) public isWhitelisted;

    /** 
        Events
    */
    event StablecoinAdded(address indexed stablecoin);
    event StablecoinRemoved(address indexed stablecoin);

    /** @notice Add a token to the whitelist.
        @param _token Address of the new stablecoin.
    */
    function addStablecoin(address _token) public onlyOwner {
        isWhitelisted[_token] = true;
        emit StablecoinAdded(_token);
    }

    /** @notice Removes a token from the whitelist.
        @param _token Address of the ex-stablecoin.
    */
    function removeStablecoin(address _token) public onlyOwner {
        isWhitelisted[_token] = false;
        emit StablecoinRemoved(_token);
    }
}