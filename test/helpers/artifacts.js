const RegulatorStorage = artifacts.require("RegulatorStorage");
const Regulator = artifacts.require("Regulator");
const AllowanceSheet = artifacts.require("AllowanceSheet");
const BalanceSheet = artifacts.require("BalanceSheet");
const RegulatorProxy = artifacts.require("RegulatorProxy")
const PermissionedToken = artifacts.require("PermissionedToken");
const MutablePermissionedToken = artifacts.require("MutablePermissionedToken");


module.exports = {
	RegulatorStorage,
	Regulator,
	AllowanceSheet,
	BalanceSheet,
	RegulatorProxy,
	PermissionedToken,
	MutablePermissionedToken
}