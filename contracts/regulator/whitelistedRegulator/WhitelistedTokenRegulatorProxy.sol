pragma solidity ^0.4.23;

import "../RegulatorProxy.sol";
import "./WhitelistedTokenRegulator.sol";

// TODO switch to eternal proxy?

/**
* @title WhitelistedTokenRegulatorProxy
* @dev Accounts for regulatory requirement changes over time. 
* Routes the WhitelistedToken to the correct version of the WhitelistedTokenRegulator
* service.
*
*/
contract WhitelistedTokenRegulatorProxy is RegulatorProxy {}