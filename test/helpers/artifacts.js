const PermissionsStorage = artifacts.require("PermissionsStorage");
const ValidatorStorage = artifacts.require("ValidatorStorage");
const Regulator = artifacts.require("Regulator");
const AllowanceSheet = artifacts.require("AllowanceSheet");
const BalanceSheet = artifacts.require("BalanceSheet");
const AdminUpgradeabilityProxy = artifacts.require("zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy")
const PermissionedToken = artifacts.require("PermissionedToken");
const MutablePermissionedToken = artifacts.require("MutablePermissionedToken");


module.exports = {
	PermissionsStorage,
	ValidatorStorage,
	Regulator,
	AllowanceSheet,
	BalanceSheet,
	AdminUpgradeabilityProxy,
	PermissionedToken,
	MutablePermissionedToken
}