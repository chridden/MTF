// Abstract contract for the full ERC 20 Token standard
// https://github.com/ethereum/EIPs/issues/20
pragma solidity ^0.4.19;

import './SafeMath.sol';
import './ERC20_mtf.sol';

/*
This Token Contract implements the standard token functionality (https://github.com/ethereum/EIPs/issues/20) as well as the following OPTIONAL extras intended for use by humans.

This contract was then adapted by Iconemy to suit the MetaFusion token 

1) Initial Finite Supply (upon creation one specifies how much is minted).
2) In the absence of a token registry: Optional Decimal, Symbol & Name.
3) Optional approveAndCall() functionality to notify a contract if an approval() has occurred.

*/
contract ERC20_mtf_allowance is ERC20_mtf {
    using SafeMath for uint256;

    mapping (address => mapping (address => uint256)) allowed;   

    // Constructor function which takes in values from migrations and passes to parent contract
    function ERC20_mtf_allowance(
        uint256 _initialAmount,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol,
        address _owner,
    ) public ERC20_mtf( _initialAmount, _tokenName, _decimalUnits, _tokenSymbol, _owner){}

    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    // Get the allowance of a spender for a certain account
    function allowanceOf(address _owner, address _spender) public constant returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        //Check the allowance of the address spending tokens on behalf of account
        uint256 allowance = allowanceOf(_from, msg.sender);
        //Require that they must have more in their allowance than they wish to send
        require(allowance >= _value);

        //Require that allowance isnt the max integer
        require(allowance < MAX_UINT256);
            
        //If so, take from their allowance and transfer
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);

        if(_transfer(_from, _to, _value)){
            return true;
        } else {
            return false;
        } 
        
    }

    // Approve the allowance for a certain spender
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function approveAndCall(address _spender, uint256 _value) public returns (bool success) {
        // This function is used by contracts to allowing the token to notify them when an approval has been made. 
        tokenSpender spender = tokenSpender(_spender);

        if(approve(_spender, _value)){
            spender.receiveApproval();
            return true;
        }
    }
}

// Interface for Metafusions crowdsale contract
contract tokenSpender { 
    function receiveApproval() external; 
}