pragma solidity ^0.4.19;

import './Ownable.sol';
import './ERC20_allowance.sol';

contract MetaFusion is Ownable, ERC20_allowance {
	string public name;
	string public symbol;
	uint256 public decimals;

	function MetaFusion(string _name, string _symbol, uint _decimals) public{
		name = _name;
		symbol = _symbol;
		decimals = _decimals;
	}
}