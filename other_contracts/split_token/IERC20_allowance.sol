pragma solidity ^0.4.19;

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
interface IERC20_allowance {
  function allowance(address owner, address spender)
    public view returns (uint256);

  function approve(address spender, uint256 value)
    public returns (bool);

  function transferFrom(address from, address to, uint256 value)
    public returns (bool);

  event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
  );
}