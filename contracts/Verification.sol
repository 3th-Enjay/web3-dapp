// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UserRegistry.sol";

contract Verification {
    UserRegistry public registry;

    constructor(address _registry) {
        registry = UserRegistry(_registry);
    }

    function register() external {
        registry.addUser();
    }

    function verify(address _user) external {
        registry.verifyUser(_user);
    }

    function isVerified(address _user) external view returns (bool) {
        return registry.isVerified(_user);
    }
}
