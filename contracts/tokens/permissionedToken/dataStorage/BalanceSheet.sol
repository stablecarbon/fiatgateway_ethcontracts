pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
* @title AllowanceSheet
* @notice A wrapper around the balanceOf mapping. Slightly modified from a TrueUSD-provided contract of the same name.
*/
contract BalanceSheet is Ownable {
    using SafeMath for uint256;

    mapping (address => uint256) public balanceOf;

    /** @notice Adds to balance of user.
        @param _address Address of user.
        @param _value Balance to add.
    */
    function addBalance(address _addr, uint256 _value) onlyOwner public {
        balanceOf[_addr] = balanceOf[_addr].add(_value);
    }

    /** @notice Subtracts from balance of user.
        @param _address Address of user.
        @param _value Balance to subtract.
    */
    function subBalance(address _addr, uint256 _value) onlyOwner public {
        balanceOf[_addr] = balanceOf[_addr].sub(_value);
    }

    /** @notice Sets balance of user.
        @param _address Address of user.
        @param _value Balance to set.
    */
    function setBalance(address _addr, uint256 _value) onlyOwner public {
        balanceOf[_addr] = _value;
    }
}