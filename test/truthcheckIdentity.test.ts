import { expect } from "chai";
import { ethers } from "hardhat";
import { TruthCheckIdentity } from "../typechain-types";

describe("TruthCheckIdentity Contract", function () {
  let identity: TruthCheckIdentity;
  let owner: any, user1: any, user2: any;

  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TruthCheckIdentity");
    identity = (await Factory.deploy()) as TruthCheckIdentity;
    await identity.deploymentTransaction()?.wait();
  });

  it("should not allow duplicate DID registration", async () => {
    const did = "did:tc:alice";
    await identity.connect(user1).register(did);
    await expect(identity.connect(user1).register(did)).to.be.revertedWith(
      "DID already registered"
    );
  });

  it("should not allow unverified users to perform restricted actions", async () => {
    await expect(identity.connect(user1).restrictedAction()).to.be.revertedWith(
      "User not verified"
    );
  });
});