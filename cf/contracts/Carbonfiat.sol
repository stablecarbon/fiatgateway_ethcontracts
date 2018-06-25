pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/StandardBurnableToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract Carbonfiat is StandardBurnableToken, MintableToken {
    using SafeMath for uint256;
    string public name = "Carbonfiat";
    string public symbol = "CF";
    uint8 public constant decimals = 18;


    function create() public {
      mint(msg.sender, 100);

    }
    function destroy() public {
      burn(100);
    }
  }
