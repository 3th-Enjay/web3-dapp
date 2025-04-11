// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TruthCheckCredentials
 * @dev Verifiable credentials with IPFS, schema IDs, reputation, multisig issuance, revocation reasons
 */
contract TruthCheckCredentials {
    struct Credential {
        string cid;            // IPFS CID
        string schemaId;       // e.g. "ProofOfEmployment"
        uint256 issuedAt;
        uint256 expiresAt;
        address issuer;        // final signer
        bool revoked;
        string revocationReason;
    }

    struct Pending {
        address holder;
        string cid;
        string schemaId;
        uint256 expiresAt;
        uint8 approvalsRequired;
        address[] approvals;
        bool exists;
    }

    mapping(bytes32 => Credential) public credentials;
    mapping(address => bytes32[]) public userCreds;
    mapping(address => bool) public issuers;
    mapping(address => uint256) public reputation;
    mapping(bytes32 => Pending) public pending;

    event IssuerAdded(address issuer);
    event IssuerRemoved(address issuer);
    event CredentialIssued(bytes32 id, address holder, address issuer);
    event PendingCreated(bytes32 id, address holder, uint8 needed);
    event CredentialApproved(bytes32 id, address approver);
    event CredentialRevoked(bytes32 id, string reason);

    modifier onlyIssuer() { require(issuers[msg.sender], "Not issuer"); _; }

    constructor() {
        issuers[msg.sender] = true;
        emit IssuerAdded(msg.sender);
    }

    function addIssuer(address i) external onlyIssuer {
        issuers[i] = true; emit IssuerAdded(i);
    }

    function removeIssuer(address i) external onlyIssuer {
        issuers[i] = false; emit IssuerRemoved(i);
    }

    // Single-signer issuance
    function issue(
        address holder,
        string calldata cid,
        string calldata schemaId,
        uint256 expiresAt
    ) external onlyIssuer returns (bytes32 id) {
        id = keccak256(abi.encodePacked(holder, cid, block.timestamp));
        credentials[id] = Credential(cid, schemaId, block.timestamp, expiresAt, msg.sender, false, "");
        userCreds[holder].push(id);
        reputation[holder] += 1;
        emit CredentialIssued(id, holder, msg.sender);
    }

    // Multi-sig initiation
    function initiate(
        address holder,
        string calldata cid,
        string calldata schemaId,
        uint256 expiresAt,
        uint8 needed
    ) external onlyIssuer returns (bytes32 id) {
        require(needed > 1, "Use issue()");
        id = keccak256(abi.encodePacked(holder, cid, block.timestamp));
        Pending storage p = pending[id];
        require(!p.exists, "Exists");
        p.holder = holder;
        p.cid = cid;
        p.schemaId = schemaId;
        p.expiresAt = expiresAt;
        p.approvalsRequired = needed;
        p.exists = true;
        p.approvals.push(msg.sender);
        emit PendingCreated(id, holder, needed);
        emit CredentialApproved(id, msg.sender);
    }

    function approve(bytes32 id) external onlyIssuer {
        Pending storage p = pending[id];
        require(p.exists, "No pending");
        for (uint i; i < p.approvals.length; i++) {
            require(p.approvals[i] != msg.sender, "Already");
        }
        p.approvals.push(msg.sender);
        emit CredentialApproved(id, msg.sender);
        if (p.approvals.length >= p.approvalsRequired) {
            credentials[id] = Credential(p.cid, p.schemaId, block.timestamp, p.expiresAt, msg.sender, false, "");
            userCreds[p.holder].push(id);
            reputation[p.holder] += 1;
            emit CredentialIssued(id, p.holder, msg.sender);
            delete pending[id];
        }
    }

    function revoke(bytes32 id, string calldata reason) external {
        Credential storage c = credentials[id];
        require(c.issuer == msg.sender, "Not issuer");
        require(!c.revoked, "Already");
        c.revoked = true;
        c.revocationReason = reason;
        reputation[c.issuer] -= 1;
        emit CredentialRevoked(id, reason);
    }

    function verify(bytes32 id) external view returns (bool) {
        Credential memory c = credentials[id];
        if (c.issuer == address(0) || c.revoked) return false;
        if (c.expiresAt != 0 && c.expiresAt < block.timestamp) return false;
        return true;
    }
}
