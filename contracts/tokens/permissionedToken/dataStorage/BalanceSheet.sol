pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// A wrapper around the balanceOf mapping. Slightly modified from TrueUSD
contract BalanceSheet {
    using SafeMath for uint256;

    mapping (address => uint256) public balanceOf;

    function addBalance(address _addr, uint256 _value) public {
        balanceOf[_addr] = balanceOf[_addr].add(_value);
    }

    function subBalance(address _addr, uint256 _value) public {
        balanceOf[_addr] = balanceOf[_addr].sub(_value);
    }

    function setBalance(address _addr, uint256 _value) public {
        balanceOf[_addr] = _value;
    }
}