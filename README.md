# fiat_gateway
Carbon's Fiat-Backed Currency

Design invariant: Users interact with proxies to indirectly access desired functionality


OwnedUpgradeabilityProxy: Combines proxy upgradeability and ownable functionalities restricting version upgrade functions to be accessible just from the declared proxy owner
------------------

UpgradeabilityOwnerStorage: keeps track of upgradeability owner
	-address private upgradeabilityOwner
	-function upgradeabilityOwner() view
	-function setUpgradeabilityOwner

OwnedUpgradeabilityProxy is UpgradeabilityOwnerStorage, UpgradeabilityProxy


UpgradeabilityProxy: Proxy, UpgradeabilityProxy and UpgradeabilityStorage are generic contracts that can be used to implement upgradeability through proxies
------------------

Proxy: delegates any calls to Proxy to a foreign implementation
	-function () payable public
		-fallback function 

UpgradeabilityStorage: holds state variables to support upgrade functionality
	-string internal version
	-address internal implementation
	-function version() view
	-function implementation() view

UpgradeabilityProxy is Proxy, UpgradeabilityStorage
	-function upgradeTo(string version, address implementation) internal
		-Upgrades the implementation address


EternalStorageProxy
-------------------

EternalStorage.sol: generic storage structure 

EternalStorageProxy is EternalStorage, OwnedUpgradeabilityProxy

TokenProxy: the contract that will delegate calls to specific implementations of the ERC20 token behavior
-------------------

Token_0 is EternalStorage
Token_1 is EternalStorage
...

TokenProxy is EternalStorageProxy

RegulatorProxy
---------------------

Regulator_0 is EternalStorage
Regulator_1 is EternalStorage
...

RegulatorProxy is EternalStorageProxy


