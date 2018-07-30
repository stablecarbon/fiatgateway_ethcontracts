const PermissionSheet = artifacts.require("PermissionSheet");
const ValidatorSheet = artifacts.require("ValidatorSheet");
const RegulatorStorage = artifacts.require("RegulatorStorage");
const Regulator = artifacts.require("Regulator");
const AllowanceSheet = artifacts.require("AllowanceSheet");
const BalanceSheet = artifacts.require("BalanceSheet");
const PermissionedTokenStorage = artifacts.require("PermissionedTokenStorage");
const RegulatorProxy = artifacts.require("RegulatorProxy")
const PermissionedToken = artifacts.require("PermissionedToken");
const MutablePermissionedToken = artifacts.require("MutablePermissionedToken");


module.exports = {
	PermissionSheet,
	ValidatorSheet,
	RegulatorStorage,
	Regulator,
	AllowanceSheet,
	BalanceSheet,
	PermissionedTokenStorage,
	RegulatorProxy,
	PermissionedToken,
	MutablePermissionedToken
}