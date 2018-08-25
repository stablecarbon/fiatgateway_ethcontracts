
// Regulator 
const RegulatorStorage = artifacts.require("RegulatorStorage");
const Regulator = artifacts.require("Regulator");
const RegulatorProxy = artifacts.require("RegulatorProxy")
const RegulatorProxyFactory = artifacts.require('RegulatorProxyFactory')

// PermissionedToken
const PermissionedToken = artifacts.require("PermissionedToken");
const PermissionedTokenStorage = artifacts.require("PermissionedTokenStorage");
const PermissionedTokenProxy = artifacts.require("PermissionedTokenProxy");

// WhitelistedToken
const WhitelistedToken = artifacts.require("WhitelistedToken");
const WhitelistedTokenRegulator = artifacts.require("WhitelistedTokenRegulator");
const WhitelistedTokenProxy = artifacts.require("WhitelistedTokenProxy");
const WhitelistedTokenProxyFactory = artifacts.require("WhitelistedTokenProxyFactory")

// CarbonDollar
const CarbonDollar = artifacts.require("CarbonDollar");
const CarbonDollarStorage = artifacts.require("CarbonDollarStorage");
const CarbonDollarRegulator = artifacts.require("CarbonDollarRegulator");
const CarbonDollarProxy = artifacts.require("CarbonDollarProxy");
const CarbonDollarProxyFactory = artifacts.require("CarbonDollarProxyFactory");

// Upgradeability
const DelayedUpgradeabilityProxy = artifacts.require("DelayedUpgradeabilityProxy");

module.exports = {
	// Regulator
	Regulator,
	RegulatorProxyFactory,
	RegulatorProxy,
	RegulatorStorage,
	// PToken
	PermissionedTokenStorage,
	PermissionedToken,
	PermissionedTokenStorage,
	PermissionedTokenProxy,
	// WToken + Regulator
	WhitelistedToken,
	WhitelistedTokenRegulator,
	WhitelistedTokenProxy,
	WhitelistedTokenProxyFactory,
	//CDollar 
	CarbonDollarProxy,
	CarbonDollarProxyFactory,
	CarbonDollar,
	CarbonDollarStorage,
	CarbonDollarRegulator,
	// Utils
	DelayedUpgradeabilityProxy
}
