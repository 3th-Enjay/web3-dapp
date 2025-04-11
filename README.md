# TruthCheck: Web3 Identity and Content Verification System

This repository contains smart contracts for a user verification system built on Ethereum (Sepolia testnet). The system consists of two main contracts: UserRegistry and Verification, designed to work together for managing user registration and verification status.
I've enhanced this application with AI-powered content verification and an improved reputation system. Here's a comprehensive overview of the current functions and capabilities:

## Core Features

### 1. Enhanced Reputation System

The reputation system now works as follows:

- *Score Range*: 0-100 points (starts at 50)
- *Reputation Gains*:

- User verification: +10 points
- Credential linking: +5 points
- Content submission: +1 point
- Credible content (verified by AI): Up to +5 points (scaled by credibility score)



- *Reputation Losses*:

- Non-credible content: Up to -3 points (scaled by negative credibility score)
- Being reported: -10 points



- *Visual Feedback*: Color-coded progress bar (red, orange, green) based on score


### 2. AI-Powered Content Verification

I've integrated OpenAI's API to analyze content uploaded to IPFS:

- *Content Types*: Text, images, and documents
- *Analysis Factors*:

- Factual accuracy
- Source reliability
- Signs of manipulation
- Logical consistency
- Potential misinformation



- *Credibility Score*: -10 to +10 scale
- *Verification Process*:

1. User submits content CID
2. AI analyzes the content
3. Results are recorded on-chain
4. User's reputation is adjusted based on content credibility





### 3. IPFS Integration

- Fetch content from IPFS using multiple gateways
- Support for different content types (text, images, documents)
- Content preview before verification


## Current Capabilities

### Identity Management

1. *Wallet Connection*: Connect MetaMask or other Web3 wallets
2. *User Registration*: Register on the TruthCheck platform
3. *DID Management*: Create and manage decentralized identifiers
4. *Credential Verification*: Verify credentials linked to DIDs
5. *Account Recovery*: Recover accounts using secure recovery keys


### Privacy & Security

1. *Privacy Settings*: Toggle between public and private modes
2. *Anonymous Reporting*: Submit reports without revealing identity
3. *Network Status*: View current blockchain network connection


### Content & Reputation

1. *Content Submission*: Submit IPFS content for verification
2. *Content Verification*: AI-powered analysis of content credibility
3. *Reputation Visualization*: View and track reputation score
4. *Transaction Sending*: Send transactions through the platform


## Smart Contract Architecture

1. *TruthCheckIdentity.sol*: Core contract for identity, reputation, and content verification
2. *TruthCheckReporting.sol*: Specialized contract for anonymous reporting
3. *TruthCheckCredentials.sol*: Manages verifiable credentials


## Technical Enhancements

1. *TypeScript Conversion*: Deployment script converted from JavaScript to TypeScript
2. *OpenAI Integration*: Added AI-powered content analysis
3. *IPFS Service*: Added robust IPFS content fetching
4. *New Components*: Added ContentSubmission and ContentVerification components
5. *Enhanced Contract*: Updated smart contract with content verification and reputation features


## How to Use the New Features

### Content Submission

1. Navigate to "Content Submission"
2. Enter the IPFS CID of your content
3. Select the content type
4. Submit the content to the blockchain
5. Earn reputation points if your content is verified as credible


### Content Verification

1. Navigate to "Content Verification"
2. Enter the IPFS CID to verify
3. Fetch and preview the content
4. Analyze the content using AI
5. View the credibility assessment
6. Submit the verification to the blockchain


## Deployment Instructions

1. Compile the contracts:

shellscript
cd contracts
npx hardhat compile



2. Deploy to Sepolia testnet:

shellscript
npx ts-node deploy-sepolia.ts



3. The script will automatically update the contract addresses in your frontend code.


This enhanced
