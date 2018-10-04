pragma solidity 0.4.24;

contract ICrowdsaleMTF {
	
	function refundToPerson(address _address) public view returns(bool);
	function withdrawInvestment() public onlyOwner;
}