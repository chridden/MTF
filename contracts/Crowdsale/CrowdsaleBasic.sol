pragma solidity 0.4.24;

import './contracts/MetaFusionToken.sol';
import './Stoppable.sol';
import './contracts/SafeMath.sol';

contract Crowdsale is Stoppable{
	using SafeMath for uint256

	//Token being sold in this crowdsale.

	MetaFusionToken public token;

	//start and end timestamps for the period of the crowdsale
	uint256 public startTime;
	uint256 public endTime;

	 // address where funds are collected
  address public wallet;
  address public contractAddr;
  
  // how many token units a buyer gets per wei
  uint256 public rate;

  // amount of raised money in wei
  uint256 public weiRaised;
  uint256 public presaleWeiRaised;

  // amount of tokens sent
  uint256 public tokensSent;

  // These store balances of participants by ID, address and in wei, pre-sale wei and tokens
  mapping(address => uint256) public balanceOf;
  mapping(address => uint256) public tokenBalanceOf;
  mapping(address => bool) public refunded;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount, uint256 datetime);
  event BeneficiaryWithdrawal(address beneficiary, uint256 amount, uint256 datetime);

  /*
   * Contructor
   * This initialises the basic crowdsale data
   * It transfers ownership of this token to the chosen beneficiary 
  */
  function Crowdsale(string _name, uint256 _saleId, bool _allocation, uint256 _startTime, uint256 _endTime, uint256 _rate, address _admin, address _beneficiary, MetaFusionToken _token)
    MetaFusionSale(_name, _saleId, _allocation)  
    public {

    require(_startTime >= now);
    require(_endTime >= _startTime);
    require(_rate > 0);
    require(_wallet != address(0));

    token = _token;
    startTime = _startTime;
    endTime = _endTime;
    rate = _rate;
    wallet = _wallet;
    transferOwnership(_wallet);
	}

	  /*
   * This method has taken from Pickeringware ltd
   * We have split this method down into overidable functions which may affect how users purchase tokens
   * We also take in a customerID (UUiD v4) which we store in our back-end in order to track users participation
  */ 
  function buyTokens() public payable stopInEmergency {
    uint256 weiAmount = msg.value;

    // calculate token amount to be created
    uint256 tokens = tokensToRecieve(weiAmount);

    // MUST DO REQUIRE AFTER tokens are calculated to check for cap restrictions in stages
    require(validPurchase(tokens));

    // We move the participants sliders before we mint the tokens to prevent re-entrancy
    finalizeSale(weiAmount, tokens);
    produceTokens(msg.sender, weiAmount, tokens);
  }

    // This was created to be overriden by stages implementation
  // It will adjust the stage sliders accordingly if needed
  function finalizeSale(uint256 _weiAmount, uint256 _tokens) internal {
    // Collect ETH and send them a token in return
    balanceOf[msg.sender] = balanceOf[msg.sender].add(_weiAmount);
    tokenBalanceOf[msg.sender] = tokenBalanceOf[msg.sender].add(_tokens);

    // update state
    weiRaised = weiRaised.add(_weiAmount);
    tokensSent = tokensSent.add(_tokens);
  }

    // @return true if crowdsale event has ended
  function hasEnded() public view returns (bool) {
    return now > endTime;
  }

}