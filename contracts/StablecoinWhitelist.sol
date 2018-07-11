// Used from TrueUSD

pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// A wrapper around the balanceOf mapping.
contract StablecoinWhitelist is Claimable {
    using SafeMath for uint256;

    mapping (address => bool) public isWhitelisted;

    event StablecoinAdded(address stablecoin);
    event StablecoinRemoved(address stablecoin);

    function addStablecoin(address stablecoin) public onlyOwner {
        isWhitelisted[stablecoin] = true;
        emit StablecoinAdded(stablecoin);
    }

    function removeStablecoin(address stablecoin) public onlyOwner {
        isWhitelisted[stablecoin] = false;
        emit StablecoinRemoved(stablecoin);
    }
}