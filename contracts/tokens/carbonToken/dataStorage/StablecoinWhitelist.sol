pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
* @title FeeSheet
* @notice Contains a mapping indicating whether or not a token contract
* is approved to participate on the CarbonUSD network.
*/
contract StablecoinWhitelist is Ownable {
    /** 
        Mappings
    */
    // (stablecoin address => is the stablecoin whitelisted)
    mapping (address => bool) public isWhitelisted;

    /** 
        Events
    */
    event StablecoinAdded(address indexed stablecoin);
    event StablecoinRemoved(address indexed stablecoin);

    /** @notice Add a stablecoin to the whitelist.
        @param stablecoin Address of the stablecoin.
    */
    function addStablecoin(address stablecoin) public onlyOwner {
        isWhitelisted[stablecoin] = true;
        emit StablecoinAdded(stablecoin);
    }

    /** @notice Removes a stablecoin from the whitelist.
        @param stablecoin Address of the stablecoin.
    */
    function removeStablecoin(address stablecoin) public onlyOwner {
        isWhitelisted[stablecoin] = false;
        emit StablecoinRemoved(stablecoin);
    }
}