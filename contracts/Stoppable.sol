pragma solidity ^0.4.19;

import './Ownable.sol';

contract Stoppable is Ownable {
  bool public halted;

  event SaleStopped(address owner, uint256 datetime);

  function Stoppable(address owner) public Ownable(owner) {}

  modifier stopInEmergency {
    require(!halted);
    _;
  }

  modifier onlyInEmergency {
    require(halted);
    _;
  }

  function hasHalted() public view returns (bool isHalted) {
  	return halted;
  }

   // called by the owner on emergency, triggers stopped state
  function stopICO() external onlyOwner {
    halted = true;
    SaleStopped(msg.sender, now);
  }
}