pragma solidity 0.4.24^;

interface tokenSpender { 
    function receiveApproval(address _from, address _token) external; 
}

contract crowdsale {
    bool hasApproval; 

    // Get the balance of this caller
    function receiveApproval(address _from, address _token) public {
        require(_from == owner);
        hasApproval = true;
    }

    function validPurchase() public payable {
        require(hasApproval);
    }
}

contract CrowdsaleMTF is ICrowdsaleMTF, CrowdsaleBasic{
	
}