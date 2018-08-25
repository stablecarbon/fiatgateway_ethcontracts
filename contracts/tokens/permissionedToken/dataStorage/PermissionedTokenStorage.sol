pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import '../../../helpers/Ownable.sol';
import "../../../regulator/Regulator.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";

/**
* @title PermissionedTokenStorage
* @notice a PermissionedTokenStorage is constructed by setting Regulator, BalanceSheet, and AllowanceSheet locations.
* Once the storages are set, they cannot be changed.
*/
contract PermissionedTokenStorage is Ownable {
    using SafeMath for uint256;

    /**
        Storage
    */
    // Regulator storing user privileges to call public methods
    Regulator public regulator;
    mapping (address => mapping (address => uint256)) public allowances;
    mapping (address => uint256) public balances;
    uint256 public totalSupply;

    /**
        Events
    */
    event ChangedRegulator(address indexed oldRegulator, address indexed newRegulator );

    constructor (address _regulator) public {
        regulator = Regulator(_regulator);
    }

    function addAllowance(address _tokenHolder, address _spender, uint256 _value) public onlyOwner {
        allowances[_tokenHolder][_spender] = allowances[_tokenHolder][_spender].add(_value);
    }

    function subAllowance(address _tokenHolder, address _spender, uint256 _value) public onlyOwner {
        allowances[_tokenHolder][_spender] = allowances[_tokenHolder][_spender].sub(_value);
    }

    function setAllowance(address _tokenHolder, address _spender, uint256 _value) public onlyOwner {
        allowances[_tokenHolder][_spender] = _value;
    }

    function allowanceOf(address _tokenHolder, address _spender) public view returns (uint256) {
        return allowances[_tokenHolder][_spender];
    }

    function addBalance(address _addr, uint256 _value) public onlyOwner {
        balances[_addr] = balances[_addr].add(_value);
    }

    function subBalance(address _addr, uint256 _value) public onlyOwner {
        balances[_addr] = balances[_addr].sub(_value);
    }

    function setBalance(address _addr, uint256 _value) public onlyOwner {
        balances[_addr] = _value;
    }

    /** ERC20 standard function **/
    function balanceOf(address _addr) public view returns (uint256) {
        return balances[_addr];
    }

    function addTotalSupply(uint256 _value) public onlyOwner {
        totalSupply = totalSupply.add(_value);
    }

    function subTotalSupply(uint256 _value) public onlyOwner {
        totalSupply = totalSupply.sub(_value);
    }

    function setTotalSupply(uint256 _value) public onlyOwner {
        totalSupply = _value;
    }

    /**
    *
    * @dev Only the token owner can change its regulator
    * @param _newRegulator the new Regulator for this token
    *
    */
    function setRegulator(address _newRegulator) public onlyOwner {
        require(_newRegulator != address(regulator), "Must be a new regulator");
        require(AddressUtils.isContract(_newRegulator), "Cannot set a regulator storage to a non-contract address");
        address old = address(regulator);
        regulator = Regulator(_newRegulator);
        emit ChangedRegulator(old, _newRegulator);
    }

}