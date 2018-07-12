// Used from TrueUSD

pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// A wrapper around the balanceOf mapping.
contract FeeSheet is Claimable {
    using SafeMath for uint16;

    /** 
        Mappings
    */
    // (stablecoin address => fee for withdrawing to stablecoin)
    mapping (address => uint16) public fees;
    // (stablecoin address => if fee is set for stablecoin)
    mapping (address => bool) public isFeeSet;

    /** 
        Events
    */
    event FeeChanged(address stablecoin, uint16 oldFee, uint16 fee);
    event FeeRemoved(address stablecoin, uint16 oldFee);
    
    /** @notice Set a fee for burning CarbonDollar into a stablecoin.
        @param stablecoin Address of stablecoin.
        @param fee Fee.
    */
    function setFee(address stablecoin, uint16 fee) public onlyOwner {
        uint16 oldFee = fees[stablecoin];
        fees[stablecoin] = fee;
        isFeeSet[stablecoin] = true;
        emit FeeChanged(stablecoin, oldFee, fee);
    }

    /** @notice Remove the fee for burning CarbonDollar into a particular kind of stablecoin.
        @param stablecoin Address of stablecoin.
    */
    function removeFee(address stablecoin) public onlyOwner {
        uint16 oldFee = fees[stablecoin];
        fees[stablecoin] = 0;
        isFeeSet[stablecoin] = false;
        emit FeeRemoved(stablecoin, oldFee);
    }

    /**
     * @notice Compute the fee that will be charged on a "burn" operation.
     * @param amount The amount that will be traded.
     * @param fee The fee that will be charged, in tenths of a percent.
     */
    function computeFee(uint256 amount, uint16 fee) public pure returns (uint256) {
        return (amount * fee) / 1000;
    }
}