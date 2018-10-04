pragma solidity 0.4.24;

contract ICrowdsaleBasic{

	function Crowdsale(string _name, uint256 _saleId, bool _allocation, uint256 _startTime, uint256 _endTime, uint256 _rate, address _admin, address _beneficiary, MetaFusionToken _token)
	function buyTokens() public payable stopInEmergency;
	function hasEnded() public view returns (bool);
	function finalizeSale(uint256 _weiAmount, uint256 _tokens) internal;
	function tokensToRecieve(uint256 _wei) internal view returns (uint256 tokens);
	function validPurchase(uint256 _tokens) internal view returns (bool)

	event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount, uint256 datetime);
  	event BeneficiaryWithdrawal(address beneficiary, uint256 amount, uint256 datetime);

}