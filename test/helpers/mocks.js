const RegulatorMock = artifacts.require("RegulatorMock")
const WhitelistedRegulatorMock = artifacts.require("WhitelistedRegulatorMock")
const CarbonDollarMock = artifacts.require("CarbonDollarMock")
const CarbonDollarMockMissingPermissions = artifacts.require("CarbonDollarMockMissingPermissions")

module.exports = {
	RegulatorMock,
	WhitelistedRegulatorMock,
	CarbonDollarMock,
	CarbonDollarMockMissingPermissions
}
