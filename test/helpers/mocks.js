const RegulatorMock = artifacts.require("RegulatorMock")
const WhitelistedRegulatorMock = artifacts.require("WhitelistedRegulatorMock")
const WhitelistedRegulatorMockMissingPermissions = artifacts.require("WhitelistedRegulatorMockMissingPermissions")
const CarbonDollarMock = artifacts.require("CarbonDollarMock")
const CarbonDollarMockMissingPermissions = artifacts.require("CarbonDollarMockMissingPermissions")

module.exports = {
	RegulatorMock,
	WhitelistedRegulatorMock,
	WhitelistedRegulatorMockMissingPermissions,
	CarbonDollarMock,
	CarbonDollarMockMissingPermissions
}
