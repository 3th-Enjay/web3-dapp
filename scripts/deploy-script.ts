import { ethers, network } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log(`Deploying to network: ${network.name}`);

  // 1. Identity
  const IdentityFactory = await ethers.getContractFactory("TruthCheckIdentity");
  const identity = await IdentityFactory.deploy();
  await identity.waitForDeployment();
  console.log("TruthCheckIdentity deployed to:", await identity.getAddress());

  // 2. Credentials
  const CredFactory = await ethers.getContractFactory("TruthCheckCredentials");
  const credentials = await CredFactory.deploy();
  await credentials.waitForDeployment();
  console.log("TruthCheckCredentials deployed to:", await credentials.getAddress());

  // 3. Reporting
  const RepFactory = await ethers.getContractFactory("TruthCheckReporting");
  const reporting = await RepFactory.deploy();
  await reporting.waitForDeployment();
  console.log("TruthCheckReporting deployed to:", await reporting.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
