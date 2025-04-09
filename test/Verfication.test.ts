import { expect } from "chai";
import { ethers } from "hardhat";

describe("Verification Flow", function () {
  let verification: any;
  let registry: any;
  let addr1: any;

  beforeEach(async function () {
    const [owner, user1] = await ethers.getSigners();
    addr1 = user1;

    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    registry = await UserRegistry.deploy();

    const Verification = await ethers.getContractFactory("Verification");
    verification = await Verification.deploy(await registry.getAddress());
  });

  it("Should register and verify user", async function () {
    await verification.connect(addr1).register();
    expect(await registry.users(addr1.address)).to.not.equal(ethers.ZeroAddress);

    await verification.verify(addr1.address);
    expect(await verification.isVerified(addr1.address)).to.equal(true);
  });
});
