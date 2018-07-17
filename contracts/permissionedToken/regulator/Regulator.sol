pragma solidity ^0.4.23;

import './PermissionStorage.sol';

/**
 * @title Regulator
 * @dev Version 0 of a Regulator
 */
contract Regulator is PermissionStorage {

	/**
	 * Events
	 *
	 */
    event PermissionAdded(bytes4 methodsignature);
    event PermissionRemoved(bytes4 methodsignature);
}
