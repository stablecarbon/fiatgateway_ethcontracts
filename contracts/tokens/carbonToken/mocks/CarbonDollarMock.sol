pragma solidity ^0.4.23;

import "../../permissionedToken/mutablePermissionedToken/mocks/MutablePermissionedTokenMock.sol";
import "../helpers/StablecoinWhitelist.sol";
import "../helpers/FeeSheet.sol";
import "../CarbonDollar.sol";

/**
* @title CarbonDollarMock
*/
contract CarbonDollarMock is MutablePermissionedTokenMock, CarbonDollar {
    constructor(address asheet,
                address bsheet,
                address v,
                address m,
                address b,
                address w, 
                address n)
            MutablePermissionedTokenMock(asheet, bsheet, v, m, b, w, n)
            public {
        stablecoinWhitelist = new StablecoinWhitelist();
        stablecoinFees = new FeeSheet();
    }
}