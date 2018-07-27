pragma solidity ^0.4.23;

import "./PermissionsStorage.sol";
import "./ValidatorStorage.sol";

contract Storage {


	/** 
    * @notice The list of possible permissions, as well as which users
    * have what permissions.
    */
    PermissionsStorage public permissions;

    /**
    * @notice Accounts with ability to set permissions.
    *
    */

    ValidatorStorage public validators;

}
