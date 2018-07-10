pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "./permissions/PermissionedTokenProxy.sol";
import "./permissions/PermissionedToken.sol";

contract CarbonToken is Ownable {
    mapping (string => address) currencyProxies; // Mapping from currency name to address of currency proxy

    event CurrencyTokenChanged(address oldToken, address newToken, string currency);
    event CurrencyProxyChanged(address oldProxy, address newProxy, string currency);

    event CurrencyBalancesMigrated(address oldToken, address newToken, address balances, string currency);
    event CurrencyAllowancesMigrated(address oldToken, address newToken, address allowances, string currency);

    /**
    * @notice Sets a currency to point to a currency proxy.
    * @param _proxy Address of the proxy pointing to an implementation of the currency's token.
    * @param _currency String indicating the name of the currency whose proxy need sto be set.
    * @return The address of the old proxy for the currency, if it was set.
    */
    function setCurrencyProxy(address _proxy, string _currency) public onlyOwner returns (address pOld) {
        require(AddressUtils.isContract(_proxy), "Proxy address is not valid");
        pOld = currencyProxies[_currency];
        currencyProxies[_currency] = _proxy;
        emit CurrencyProxyChanged(pOld, _proxy, _currency);
    }

    /**
    * @notice Sets a currency proxy to point to a particular token implementation.
    * @param _proxy Address of the token implementation.
    * @param _currency String indicating the name of the currency whose proxy need sto be set.
    * @return The address of the old token implementation for the currency, if it was set.
    */
    function setCurrencyToken(address tokenAddr, string currency, bool migrateData) public onlyOwner returns (address oldAddr) {
        require(AddressUtils.isContract(currencyProxies[currency]), "Currency proxy not set");
        require(AddressUtils.isContract(tokenAddr), "Token contract address is not valid");
        PermissionedTokenProxy p = PermissionedTokenProxy(currencyProxies[currency]);
        oldAddr = p.implementation();
        p.upgradeTo(tokenAddr);
        if (migrateData) migrateAll(oldAddr, currency);
        emit CurrencyTokenChanged(oldAddr, tokenAddr, currency);
    }

    /**
    * @notice Migrates all data (allowances and balances) from an old token implementation to a new token implementation.
    * @param _proxy Address of the old token implementation.
    * @param _currency String indicating the name of the currency whose token implementation needs the data upgrade.
    */
    function migrateAll(address tokenAddr, string currency) public onlyOwner {
        migrateBalances(tokenAddr, currency);
        migrateAllowances(tokenAddr, currency);
    }

    /**
    * @notice Migrates all balances from an old token implementation to a new token implementation.
    * @param _proxy Address of the old token implementation.
    * @param _currency String indicating the name of the currency whose token implementation needs the data upgrade.
    */
    function migrateBalances(address tokenAddr, string currency) public onlyOwner {
        PermissionedToken pOld = PermissionedToken(tokenAddr);
        PermissionedToken pNew = PermissionedToken(currencyProxies[currency]);
        pNew.setBalanceSheet(address(pOld.balances));
        emit CurrencyBalancesMigrated(tokenAddr, address(pNew), address(pOld.balances), currency);
    }

    /**
    * @notice Migrates all allowances from an old token implementation to a new token implementation.
    * @param _proxy Address of the old token implementation.
    * @param _currency String indicating the name of the currency whose token implementation needs the data upgrade.
    */
    function migrateAllowances(address tokenAddr, string currency) public onlyOwner {
        PermissionedToken pOld = PermissionedToken(tokenAddr);
        PermissionedToken pNew = PermissionedToken(currencyProxies[currency]);
        pNew.setAllowanceSheet(address(pOld.allowances));
        emit CurrencyAllowancesMigrated(tokenAddr, address(pNew), address(pOld.allowances), currency);
    }
}