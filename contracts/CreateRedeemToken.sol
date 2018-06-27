pragma solidity ^0.4.23;

// Token frameworks
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";

// Modifiers
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

// Utility methods
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title CreateRedeem token 
 * @dev Each account has fiat credits and a balance. Fiat credits can be burned to create token balance. 
 *		Tokens can be redeemed back into fiat credits.
 *
 *		Approved accounts can transfer on behalf of other addresses, but cannot burn. Only original owner can burn.
 */
contract CreateRedeemToken is Ownable, PausableToken, BurnableToken {
 	using SafeMath for uint256;

 	mapping (address => uint256) fiatCredits;

 	
 	// Events
 	event DepositedFiatCredits(address indexed to, uint256 amount);
 	event ConvertedFiatCredits(address indexed to, uint256 amount);
 	event RedeemedTokens(address indexed to, uint256 amount);

 	// Methods 

 	/**
	  * @dev Gets the amount of fiat credits of the specified address.
	  * @param _owner The address to query the the balance of.
	  * @return An uint256 representing the fiat credits owned by the passed address.
	  */
	 function fiatCreditsOf(address _owner) public view returns (uint256) {
	 	return fiatCredits[_owner];
	 }

	/**
	* @dev Function to add fiat credits
	* @param _to The address that will receive the fiat credits.
	* @param _amount The amount of fiat credits to create.
	* @return A boolean that indicates if the operation was successful.
	*/
	function addFiatCredits(address _to, uint256 _amount) onlyOwner public returns(bool) {
		fiatCredits[_to] = fiatCredits[_to].add(_amount);
		emit DepositedFiatCredits(_to, _amount);
		return true;
	}

 	/**
	* @dev Function to create tokens (similar to minting, but without the onlyOwner modifier). 
			Allows creating only up to fiatCredit amount of address.
			The onlyOwner modifier is removed since any user can mint as long as they have 
			enough fiatCredits.
	* @param _amount The amount of tokens to mint.
	*/
	function create(uint256 _amount) public {
		_create(msg.sender, _amount);
	}

	function _create(address _who, uint256 _amount) internal {
		require(_amount <= fiatCredits[_who]);
		
		// Fiat credits are converted into CreateRedeemTokens in 1:1 ratio
		fiatCredits[_who] = fiatCredits[_who].sub(_amount);
		totalSupply_ = totalSupply_.add(_amount);
		balances[_who] = balances[_who].add(_amount);
		emit ConvertedFiatCredits(_who, _amount);
		emit Transfer(address(0), _who, _amount);
	}

	/**
	* @dev Burns a specific amount of tokens. Adds an event call and modifies fiatCredits balance.
	* @param _amount The amount of token to be burned.
	*/
	function burn(uint256 _amount) public {
		_burn(msg.sender, _amount);
	}

	function _burn(address _who, uint256 _amount) internal {
		require(_amount <= balances[_who]);
		// no need to require value <= totalSupply, since that would imply the
		// sender's balance is greater than the totalSupply, which *should* be an assertion failure

		balances[_who] = balances[_who].sub(_amount);
		totalSupply_ = totalSupply_.sub(_amount);
		fiatCredits[_who] = fiatCredits[_who].add(_amount);
		emit RedeemedTokens(_who, _amount);
		emit Transfer(_who, address(0), _amount);
	}

 }