pragma solidity ^0.4.23;

import '../eternalStorage/EternalStorage.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * @title EternalStandardToken
 * @dev Version 0 of a token to show upgradeability.
 */
contract EternalStandardToken is EternalStorage {
  using SafeMath for uint256;

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);

  function totalSupply() public view returns (uint256) {
    return uintStorage[keccak256("totalSupply")];
  }

  function balanceOf(address owner) public view returns (uint256) {
    return uintStorage[keccak256(abi.encode("balance", owner))];
  }

  function allowance(address owner, address spender) public view returns (uint256) {
    return uintStorage[keccak256(abi.encode("allowance", owner, spender))];
  }

  function transfer(address to, uint256 value) public {
    bytes32 balanceToHash = keccak256(abi.encode("balance", to));
    bytes32 balanceSenderHash = keccak256(abi.encode("balance", msg.sender));

    require(to != address(0));
    require(uintStorage[balanceSenderHash] >= value);

    uintStorage[balanceSenderHash] = balanceOf(msg.sender).sub(value);
    uintStorage[balanceToHash] = balanceOf(to).add(value);
    emit Transfer(msg.sender, to, value);
  }

  function transferFrom(address from, address to, uint256 value) public {
    bytes32 balanceToHash = keccak256(abi.encode("balance", to));
    bytes32 balanceFromHash = keccak256(abi.encode("balance", from));
    bytes32 allowanceFromToSenderHash = keccak256(abi.encode("allowance", from, msg.sender));

    require(to != address(0));
    require(uintStorage[balanceFromHash] >= value );
    require(uintStorage[allowanceFromToSenderHash] >= value);

    uintStorage[balanceFromHash] = balanceOf(from).sub(value);
    uintStorage[balanceToHash] = balanceOf(to).add(value);
    uintStorage[allowanceFromToSenderHash] = allowance(from, msg.sender).sub(value);
    emit Transfer(from, to, value);
  }

  function approve(address spender, uint256 value) public {
    bytes32 allowanceSenderToSpenderHash = keccak256(abi.encode("allowance", msg.sender, spender));
    uintStorage[allowanceSenderToSpenderHash] = value;
    emit Approval(msg.sender, spender, value);
  }

  function increaseApproval(address spender, uint256 addedValue) public {
    bytes32 allowanceSenderToSpenderHash = keccak256(abi.encode("allowance", msg.sender, spender));
    uintStorage[allowanceSenderToSpenderHash] = allowance(msg.sender, spender).add(addedValue);
    emit Approval(msg.sender, spender, allowance(msg.sender, spender));
  }

  function decreaseApproval(address spender, uint256 subtractedValue) public {
    uint256 oldValue = allowance(msg.sender, spender);
    bytes32 allowanceSenderToSpenderHash = keccak256(abi.encode("allowance", msg.sender, spender));
    if (subtractedValue > oldValue) {
      uintStorage[allowanceSenderToSpenderHash] = 0;
    } else {
      uintStorage[allowanceSenderToSpenderHash] = oldValue.sub(subtractedValue);
    }
    emit Approval(msg.sender, spender, allowance(msg.sender, spender));
  }

  function mint(address to, uint256 value) public {
    bytes32 balanceToHash = keccak256(abi.encode("balance", to));
    bytes32 totalSupplyHash = keccak256("totalSupply");

    uintStorage[balanceToHash] = balanceOf(to).add(value);
    uintStorage[totalSupplyHash] = totalSupply().add(value);
    emit Transfer(0x0, to, value);
  }
}