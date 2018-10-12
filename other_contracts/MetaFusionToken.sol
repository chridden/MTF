pragma solidity ^0.4.24;

import './Ownable.sol';
import './ERC20.sol';

contract MetaFusion is Ownable, ERC20 {

	string public name;
	string public symbol;
	uint8 public decimals;

	constructor(string _name, string _symbol, uint _decimals) public{
		name = _name;
		symbol = _symbol;
		decimals = _decimals;
	}
}