pragma solidity ^0.4.23;

import './EternalStandardToken.sol';
import './Ownable.sol';

/**
 * @title EternalMintableToken
 * @dev Version 1 of a token to show upgradeability.
 * The idea here is to extend a token behaviour providing mintable token functionalities
 * in addition to what's provided in version 0
 */
contract EternalMintableToken is EternalStandardToken, Ownable {
  event Mint(address indexed to, uint256 amount);
  event MintFinished();

  modifier canMint() {
    require(!mintingFinished());
    _;
  }

  function initialize(address owner) public {
    require(!initialized());
    setOwner(owner);
    boolStorage[keccak256('EternalMintableToken_initialized')] = true;
  }

  function initialized() public view returns (bool) {
    return boolStorage[keccak256('EternalMintableToken_initialized')];
  }

  function mintingFinished() public view returns (bool) {
    return boolStorage[keccak256('mintingFinished')];
  }

  function mint(address to, uint256 value) public onlyOwner canMint {
    super.mint(to, value);
    emit Mint(to, value);
  }

  function finishMinting() public onlyOwner canMint {
    boolStorage[keccak256('mintingFinished')] = true;
    emit MintFinished();
  }
}