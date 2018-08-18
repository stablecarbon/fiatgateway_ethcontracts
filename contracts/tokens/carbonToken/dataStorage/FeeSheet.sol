pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import '../../../helpers/Ownable.sol';

/**
* @title FeeSheet
* @notice Contains fee amounts for burning CUSD into a stablecoin, AKA 'conversions'
*/
contract FeeSheet is Ownable {
    using SafeMath for uint256;

    /** @dev Units for fees are always in a tenth of a percent */
    uint256 public defaultFee;

    /** 
        Mappings
    */
    /* fees for withdrawing to stablecoin, in tenths of a percent) */
    mapping (address => uint256) public fees;
    mapping (address => bool) public isFeeSet;

    /** 
        Events
    */
    event DefaultFeeChanged(uint256 oldFee, uint256 newFee);
    event FeeChanged(address indexed stablecoin, uint256 oldFee, uint256 newFee);
    event FeeRemoved(address indexed stablecoin, uint256 oldFee);

    /** @notice Sets the default fee for burning CarbonDollar into a whitelisted stablecoin.
        @param _fee The default fee.
    */
    function setDefaultFee(uint256 _fee) public onlyOwner {
        uint256 oldFee = defaultFee;
        defaultFee = _fee;
        if (oldFee != defaultFee)
            emit DefaultFeeChanged(oldFee, _fee);
    }
    
    /** @notice Set a fee for burning CarbonDollar into a stablecoin.
        @param _stablecoin Address of a whitelisted stablecoin.
        @param _fee the fee.
    */
    function setFee(address _stablecoin, uint256 _fee) public onlyOwner {
        uint256 oldFee = fees[_stablecoin];
        fees[_stablecoin] = _fee;
        isFeeSet[_stablecoin] = true;
        if (oldFee != _fee)
            emit FeeChanged(_stablecoin, oldFee, _fee);
    }

    /** @notice Remove the fee for burning CarbonDollar into a particular kind of stablecoin.
        @param _stablecoin Address of stablecoin.
    */
    function removeFee(address _stablecoin) public onlyOwner {
        uint256 oldFee = fees[_stablecoin];
        fees[_stablecoin] = 0;
        isFeeSet[_stablecoin] = false;
        if (oldFee != 0)
            emit FeeRemoved(_stablecoin, oldFee);
    }

    /**
     * @notice Compute the fee that will be charged on a "burn" operation.
     * @param _amount The amount that will be traded.
     * @param _stablecoin The stablecoin whose fee will be used.
     */
    function computeStablecoinFee(uint256 _amount, address _stablecoin) public view returns (uint256) {
        uint256 fee = fees[_stablecoin];
        return computeFee(_amount, fee);
    }

    /**
     * @notice Compute the fee that will be charged on a "burn" operation.
     * @param _amount The amount that will be traded.
     * @param _fee The fee that will be charged, in tenths of a percent.
     */
    function computeFee(uint256 _amount, uint256 _fee) public pure returns (uint256) {
        return _amount.mul(_fee).div(1000);
    }
}