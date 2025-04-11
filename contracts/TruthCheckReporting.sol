// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TruthCheckReporting
 * @dev Anonymous reporting (hash only), categories, admin resolution
 */
contract TruthCheckReporting {
    struct Report {
        bytes32 hash;       // keccak256(reportData)
        uint256 timestamp;
        bool resolved;
        address resolver;
        bytes32 category;   // keccak256(categoryLabel)
    }

    mapping(uint256 => Report) public reports;
    mapping(address => uint256[]) private myReports;
    mapping(address => bool) public admins;
    uint256 public reportCount;

    event Submitted(uint256 id, bytes32 category);
    event Resolved(uint256 id, address resolver);

    modifier onlyAdmin() { require(admins[msg.sender], "Only admin"); _; }

    constructor() { admins[msg.sender] = true; }

    function addAdmin(address a) external onlyAdmin {
        admins[a] = true;
    }

    function submit(bytes32 reportHash, bytes32 category) external returns (uint256 id) {
        id = reportCount++;
        reports[id] = Report(reportHash, block.timestamp, false, address(0), category);
        myReports[msg.sender].push(id);
        emit Submitted(id, category);
    }

    function resolve(uint256 id) external onlyAdmin {
        Report storage r = reports[id];
        require(!r.resolved, "Already");
        r.resolved = true;
        r.resolver = msg.sender;
        emit Resolved(id, msg.sender);
    }

    function getMyReports() external view returns (uint256[] memory) {
        return myReports[msg.sender];
    }
}
