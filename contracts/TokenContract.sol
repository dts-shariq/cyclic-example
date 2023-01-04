// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../openzeppelin/token/ERC20/ERC20.sol";

contract TokenContract is ERC20 {

constructor() ERC20("Ebizon Token", "ETK"){}

  function mint(address account, uint256 amount) public returns (bool) {
    _mint(account, amount);
    return true;
  }

}