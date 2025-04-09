import { ethers } from "hardhat";

async function main() {
  const userRegistry = await ethers.deployContract("UserRegistry");
  await userRegistry.waitForDeployment();

  const verification = await ethers.deployContract("Verification", [
    await userRegistry.getAddress(),
  ]);
  await verification.waitForDeployment();

  console.log("UserRegistry:", await userRegistry.getAddress());
  console.log("Verification:", await verification.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
