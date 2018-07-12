// Used from TrueUSD

pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// A wrapper around the balanceOf mapping.
contract FeeSheet is Claimable {
    using SafeMath for uint256;

    mapping (address => uint16) public fees;
    mapping (address => bool) public isFeeSet;

    event FeeChanged(address stablecoin, uint16 oldFee, uint16 fee);
    event FeeRemoved(address stablecoin, uint16 oldFee);
    function setFee(address stablecoin, uint16 fee) public onlyOwner {
        uint16 oldFee = fees[stablecoin];
        fees[stablecoin] = fee;
        isFeeSet[stablecoin] = true;
        emit FeeChanged(stablecoin, oldFee, fee);
    }

    function removeFee(address stablecoin) public onlyOwner {
        uint16 oldFee = fees[stablecoin];
        fees[stablecoin] = 0;
        isFeeSet[stablecoin] = false;
        emit FeeRemoved(stablecoin, oldFee);
    }
}