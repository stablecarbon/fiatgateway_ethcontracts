const PermissionSheet = artifacts.require("PermissionSheet");
const ValidatorSheet = artifacts.require("ValidatorSheet");
const Regulator = artifacts.require("Regulator");
const AllowanceSheet = artifacts.require("AllowanceSheet");
const BalanceSheet = artifacts.require("BalanceSheet");
const RegulatorProxy = artifacts.require("RegulatorProxy")
const PermissionedToken = artifacts.require("PermissionedToken");
const PermissionedTokenStorageState = artifacts.require("PermissionedTokenStorageState");


module.exports = {
	PermissionSheet,
	ValidatorSheet,
	Regulator,
	AllowanceSheet,
	BalanceSheet,
	RegulatorProxy,
	PermissionedToken,
	PermissionedTokenStorageState
}