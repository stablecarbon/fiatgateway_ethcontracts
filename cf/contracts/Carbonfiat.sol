pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/StandardBurnableToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract Carbonfiat is StandardBurnableToken, MintableToken {
    using SafeMath for uint256;
    string public name = "CarbonFiat";
    string public symbol = "CF";
    uint8 public constant decimals = 18;




  }
