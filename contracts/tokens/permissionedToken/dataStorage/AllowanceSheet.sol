pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
* @title AllowanceSheet
* @notice A wrapper around an allowance mapping. Slightly modified from a TrueUSD-provided contract of the same name.
*/
contract AllowanceSheet is Ownable {
    using SafeMath for uint256;

    mapping (address => mapping (address => uint256)) public allowanceOf;

    /** @notice Adds to the allowance of a user.
        @param _tokenHolder Address of user that holds tokens (the "from" account.)
        @param _spender Address of user that will spend from the token holder.
        @param _value Amount that spender will be approved to spend, above their current allowance.
    */
    function addAllowance(address _tokenHolder, address _spender, uint256 _value) onlyOwner public {
        allowanceOf[_tokenHolder][_spender] = allowanceOf[_tokenHolder][_spender].add(_value);
    }

    /** @notice Subtracts from the allowance of a user.
        @param _tokenHolder Address of user that holds tokens (the "from" account.)
        @param _spender Address of user that will spend from the token holder.
        @param _value Amount that spender will no longer be approved to spend.
    */
    function subAllowance(address _tokenHolder, address _spender, uint256 _value) onlyOwner public {
        allowanceOf[_tokenHolder][_spender] = allowanceOf[_tokenHolder][_spender].sub(_value);
    }

    /** @notice Sets the allowance of a user.
        @param _tokenHolder Address of user that holds tokens (the "from" account.)
        @param _spender Address of user that will spend from the token holder.
        @param _value Amount that spender will be approved to spend.
    */
    function setAllowance(address _tokenHolder, address _spender, uint256 _value) onlyOwner public {
        allowanceOf[_tokenHolder][_spender] = _value;
    }
}