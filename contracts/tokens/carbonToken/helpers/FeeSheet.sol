pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// A wrapper around the balanceOf mapping.
contract FeeSheet is Claimable {
    using SafeMath for uint16;

    /** @dev Units for fees are always in a tenth of a percent */
    uint16 public defaultFee; // Default fee for conversions

    /** 
        Mappings
    */
    // (stablecoin address => fee for withdrawing to stablecoin, in tenths of a percent)
    mapping (address => uint16) public fees;
    // (stablecoin address => if fee is set for stablecoin)
    mapping (address => bool) public isFeeSet;

    /** 
        Events
    */
    event DefaultFeeChanged(uint16 oldFee, uint16 newFee);
    event FeeChanged(address stablecoin, uint16 oldFee, uint16 newFee);
    event FeeRemoved(address stablecoin, uint16 oldFee);

    /** @notice Sets the default fee for burning CarbonDollar into a stablecoin.
        @param fee The default fee.
    */
    function setDefaultFee(uint16 fee) public onlyOwner {
        uint16 oldFee = defaultFee;
        defaultFee = fee;
        if (fee != defaultFee)
            emit DefaultFeeChanged(oldFee, fee);
    }
    
    /** @notice Set a fee for burning CarbonDollar into a stablecoin.
        @param stablecoin Address of stablecoin.
        @param fee Fee.
    */
    function setFee(address stablecoin, uint16 fee) public onlyOwner {
        uint16 oldFee = fees[stablecoin];
        fees[stablecoin] = fee;
        isFeeSet[stablecoin] = true;
        if (oldFee != fee)
            emit DefaultFeeChanged(oldFee, fee);
    }

    /** @notice Remove the fee for burning CarbonDollar into a particular kind of stablecoin.
        @param stablecoin Address of stablecoin.
    */
    function removeFee(address stablecoin) public onlyOwner {
        uint16 oldFee = fees[stablecoin];
        fees[stablecoin] = 0;
        isFeeSet[stablecoin] = false;
        if (oldFee != 0)
            emit FeeRemoved(stablecoin, oldFee);
    }

    /**
     * @notice Compute the fee that will be charged on a "burn" operation.
     * @param amount The amount that will be traded.
     * @param stablecoin The stablecoin whose fee will be used.
     */
    function computeStablecoinFee(uint256 amount, address stablecoin) public view returns (uint256) {
        uint16 fee = fees[stablecoin];
        return computeFee(amount, fee);
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