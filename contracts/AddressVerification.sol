pragma solidity ^0.4.24;

contract AddressVerification {
    // storage of codes provided by users
    mapping (address => uint32) public address_codes;

    // stores booleans indicating whetehr user sent a code
    mapping (address => bool) public address_sent_status;

    /* @dev Emits event for server to verify whether the message
     * sender is a valid address.
     */
    function verifyAddress (uint32 verificationCode) public {
        address_codes[msg.sender] = verificationCode;
        address_sent_status[msg.sender] = true;
    }
}
