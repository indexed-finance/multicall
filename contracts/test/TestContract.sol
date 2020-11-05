// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;


contract TestContract {
  struct TestStruct {
    uint256 a;
    uint8[] b;
  }

  function getUint() public pure returns (uint256) {
    return uint256(1e20);
  }

  function getUint2() public pure returns (uint256, uint256) {
    return (uint256(1e18), uint256(1e19));
  }

  function getUintArray() public pure returns (uint256[] memory arr) {
    arr = new uint256[](2);
    arr[0] = 1e20;
    arr[1] = 1e18;
  }

  function getUintArray2() public pure returns (uint256[] memory arr) {
    arr = new uint256[](1);
    arr[0] = 1e20;
  }

  function getStruct() public pure returns (TestStruct memory ret) {
    uint8[] memory arr = new uint8[](2);
    arr[0] = 50;
    arr[1] = 2;
    ret = TestStruct(1e18, arr);
  }

  function doRevert() public pure returns (uint256) {
    revert("Triggered error D:");
  }
}