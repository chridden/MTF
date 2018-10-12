pragma solidity ^0.4.24;

contract MetaFusionSale{
	string public name;
	bool public allocation;
	uint256 public saleID;

	constructor(string _name, bool _allocation, uint256 _saleID) public {
		name = _name;
		allocation = _allocation;
		saleID= _saleID;
	}
}