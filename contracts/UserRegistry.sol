// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserRegistry {
    struct User {
        address wallet;
        bool verified;
        uint256 registeredAt;
    }

    mapping(address => User) public users;

    event UserAdded(address indexed user);
    event UserVerified(address indexed user);

    function addUser() external {
        require(users[msg.sender].wallet == address(0), "User already exists");
        users[msg.sender] = User(msg.sender, false, block.timestamp);
        emit UserAdded(msg.sender);
    }

    function verifyUser(address _user) external {
        require(users[_user].wallet != address(0), "User not registered");
        users[_user].verified = true;
        emit UserVerified(_user);
    }

    function isVerified(address _user) external view returns (bool) {
        return users[_user].verified;
    }
}
