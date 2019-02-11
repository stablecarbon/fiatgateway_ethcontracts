
// Regulator 
const RegulatorStorage = artifacts.require("RegulatorStorage");
const Regulator = artifacts.require("Regulator");
const RegulatorProxy = artifacts.require("RegulatorProxy")
const RegulatorProxyFactory = artifacts.require('RegulatorProxyFactory')

// PermissionedToken
const PermissionedToken = artifacts.require("PermissionedToken");
const PermissionedTokenStorage = artifacts.require("PermissionedTokenStorage");
const PermissionedTokenProxy = artifacts.require("PermissionedTokenProxy");
const PermissionedTokenProxyFactory = artifacts.require("PermissionedTokenProxyFactory");

// MetaToken
const MetaToken = artifacts.require("MetaToken")

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
	PermissionedTokenProxyFactory,
	// Utils
	DelayedUpgradeabilityProxy,
	// MetaToken
	MetaToken
}
