
// Regulator 
const PermissionSheet = artifacts.require("PermissionSheet");
const ValidatorSheet = artifacts.require("ValidatorSheet");
const Regulator = artifacts.require("Regulator");
const RegulatorProxy = artifacts.require("RegulatorProxy")


// PermissionedToken
const AllowanceSheet = artifacts.require("AllowanceSheet");
const BalanceSheet = artifacts.require("BalanceSheet");
const PermissionedToken = artifacts.require("PermissionedToken");
const PermissionedTokenProxy = artifacts.require("PermissionedTokenProxy");

// WhitelistedToken
const WhitelistedToken = artifacts.require("WhitelistedToken");
const WhitelistedTokenRegulator = artifacts.require("WhitelistedTokenRegulator");

// CarbonDollar
const CarbonDollar = artifacts.require("CarbonDollar");
const FeeSheet = artifacts.require("FeeSheet");
const StablecoinWhitelist = artifacts.require("StablecoinWhitelist");
const CarbonDollarRegulator = artifacts.require("CarbonDollarRegulator");


module.exports = {
	PermissionSheet,
	ValidatorSheet,
	Regulator,
	AllowanceSheet,
	BalanceSheet,
	RegulatorProxy,
	PermissionedToken,
	PermissionedTokenProxy,
	WhitelistedToken,
	WhitelistedTokenRegulator,
	CarbonDollar,
    FeeSheet,
    StablecoinWhitelist,
    CarbonDollarRegulator
}

