import { expect } from "chai";
import { ethers } from "hardhat";
import { TruthCheckCredentials } from "../typechain-types";

describe("TruthCheckCredentials Contract", function () {
  let credentials: TruthCheckCredentials;
  let owner: any, user1: any, user2: any;

  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TruthCheckCredentials");
    credentials = (await Factory.deploy()) as TruthCheckCredentials;
    await credentials.deploymentTransaction()?.wait();
  });

  it("should not allow non-issuers to issue credentials", async () => {
    const cid = "QmTestCid";
    const schema = "ProofSingle";
    await expect(
      credentials.connect(user1).issue(user1.address, cid, schema, 0)
    ).to.be.revertedWith("Not an issuer");
  });

  it("should revoke a credential and mark it as invalid", async () => {
    const cid = "QmTestCid";
    const schema = "ProofSingle";
    const tx = await credentials.issue(user1.address, cid, schema, 0);
    const receipt = await tx.wait();
    const event = receipt.logs.find(
      (log: any) => log.fragment?.name === "CredentialIssued"
    ) as ethers.EventLog;
    const id = event.args[0];

    await credentials.revoke(id, "Test reason");
    const valid = await credentials.verify(id);
    expect(valid).to.be.false;
  });
});
