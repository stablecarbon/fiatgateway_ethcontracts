pragma solidity ^0.4.24;

/**
* @title AddressVerification
* @notice AddressVerification contains an essentially useless function that allows users to verify that they own an ETH address
* that they claim they own. If a user claims to own the ETH address 0x123..., then they should be able to send a transaction
* to this contract from that public key
*/
contract AddressVerification {
    
    // storage of codes provided by users
    mapping (address => uint32) public address_codes;

    // stores booleans indicating whetehr user sent a code
    mapping (address => bool) public address_sent_status;

    /* @dev Store a verification code that the user sends. Designed for
     * server to check if server-produced verifiation code matches the code stored
     * on this contract
     */
    function verifyAddress (uint32 verificationCode) public {
        address_codes[msg.sender] = verificationCode;
        address_sent_status[msg.sender] = true;
    }
}
