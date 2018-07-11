// Used from TrueUSD

pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// A wrapper around the balanceOf mapping.
contract StablecoinWhitelist is Claimable {
    using SafeMath for uint256;

    mapping (address => bool) public whitelist;

    event StablecoinAdded(address stablecoin);
    event StablecoinRemoved(address stablecoin);

    function addStablecoin(address stablecoin) public onlyOwner {
        whitelist[stablecoin] = true;
        emit StablecoinAdded(stablecoin);
    }

    function removeStablecoin(address stablecoin) public onlyOwner {
        whitelist[stablecoin] = false;
        emit StablecoinRemoved(stablecoin);
    }

    function isWhitelisted(address stablecoin) public view returns (bool) {
        return isWhitelisted[stablecoin];
    }
}