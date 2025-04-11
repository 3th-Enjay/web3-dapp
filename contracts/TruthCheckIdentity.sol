// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TruthCheckIdentity
 * @dev DID management, reputation, multi-sig key recovery hooks
 */
contract TruthCheckIdentity {
    struct User {
        address wallet;
        bool verified;
        uint256 registeredAt;
        string did;              // DID string (e.g. "did:tc:1234...")
        uint256 reputation;
        bool isPrivate;
        bool isActive;
    }

    mapping(address => User) public users;
    mapping(address => address[]) public delegates;         // multi-sig delegates
    mapping(string => address) public didToAddress;
    mapping(address => bool) public admins;

    event UserRegistered(address indexed user, string did);
    event UserVerified(address indexed user);
    event DelegateAdded(address indexed user, address indexed delegate);
    event PrivacyToggled(address indexed user, bool isPrivate);
    event ReputationUpdated(address indexed user, uint256 newScore);

    modifier onlyAdmin() { require(admins[msg.sender], "Only admin"); _; }
    modifier onlyActive(address u) { require(users[u].isActive, "Inactive"); _; }

    constructor() { admins[msg.sender] = true; }

    function register(string calldata _did) external {
        require(users[msg.sender].wallet == address(0), "Exists");
        users[msg.sender] = User({
            wallet: msg.sender,
            verified: false,
            registeredAt: block.timestamp,
            did: _did,
            reputation: 0,
            isPrivate: false,
            isActive: true
        });
        didToAddress[_did] = msg.sender;
        emit UserRegistered(msg.sender, _did);
    }

    function verifyUser(address _u) external onlyAdmin onlyActive(_u) {
        users[_u].verified = true;
        _updateReputation(_u, users[_u].reputation + 10);
        emit UserVerified(_u);
    }

    function addDelegate(address _delegate) external onlyActive(msg.sender) {
        delegates[msg.sender].push(_delegate);
        emit DelegateAdded(msg.sender, _delegate);
    }

    function togglePrivacy() external onlyActive(msg.sender) {
        users[msg.sender].isPrivate = !users[msg.sender].isPrivate;
        emit PrivacyToggled(msg.sender, users[msg.sender].isPrivate);
    }

    function _updateReputation(address _u, uint256 _new) internal {
        require(_new <= 100, "Max 100");
        users[_u].reputation = _new;
        emit ReputationUpdated(_u, _new);
    }

    // Hooks for ZKP-based private verification can be added here
    // e.g. function submitZKP(bytes calldata proof) external { ... }
}
