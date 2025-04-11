import { expect } from "chai";
import { ethers, EventLog } from "ethers";
import { TruthCheckReporting } from "../typechain-types";

describe("TruthCheckReporting Contract", function () {
  let reporting: TruthCheckReporting;
  let owner: any, user1: any;

  before(async () => {
    [owner, user1] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TruthCheckReporting");
    reporting = (await Factory.deploy()) as TruthCheckReporting;
    await reporting.deploymentTransaction()?.wait();
  });

  it("should not allow duplicate reports for the same hash", async () => {
    const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Duplicate report"));
    const category = ethers.keccak256(ethers.toUtf8Bytes("Spam"));

    await reporting.connect(user1).submit(reportHash, category);
    await expect(
      reporting.connect(user1).submit(reportHash, category)
    ).to.be.revertedWith("Report already exists");
  });

  it("should not allow non-admins to resolve reports", async () => {
    const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Test report"));
    const category = ethers.keccak256(ethers.toUtf8Bytes("Spam"));

    const tx = await reporting.connect(user1).submit(reportHash, category);
    const receipt = await tx.wait();
    if (!receipt) throw new Error("Transaction receipt not found");
    const event = receipt.logs.find(
      (log: any) => log.fragment?.name === "ReportSubmitted"
    ) as EventLog;
    const reportId = event.args[0];

    await expect(
      reporting.connect(user1).resolve(reportId)
    ).to.be.revertedWith("Not an admin");
  });
});