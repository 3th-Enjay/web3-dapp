import { expect } from "chai";
import { ethers } from "hardhat";
import {
  TruthCheckIdentity,
  TruthCheckCredentials,
  TruthCheckReporting,
} from "../typechain-types";

describe("TruthCheck Suite", function () {
  let identity: TruthCheckIdentity;
  let credentials: TruthCheckCredentials;
  let reporting: TruthCheckReporting;
  let owner: any, user1: any, user2: any;

  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy Identity Contract
    {
      const Factory = await ethers.getContractFactory("TruthCheckIdentity");
      identity = (await Factory.deploy()) as TruthCheckIdentity;
      await identity.deploymentTransaction().then((tx) => tx.wait());
    }

    // Deploy Credentials Contract
    {
      const Factory = await ethers.getContractFactory("TruthCheckCredentials");
      credentials = (await Factory.deploy()) as TruthCheckCredentials;
      await credentials.deploymentTransaction().then((tx) => tx.wait());
    }

    // Deploy Reporting Contract
    {
      const Factory = await ethers.getContractFactory("TruthCheckReporting");
      reporting = (await Factory.deploy()) as TruthCheckReporting;
      await reporting.deploymentTransaction().then((tx) => tx.wait());
    }
  });

  describe("Identity Contract", () => {
    it("should register a user with DID", async () => {
      const did = "did:tc:alice";
      await expect(identity.connect(user1).register(did))
        .to.emit(identity, "UserRegistered")
        .withArgs(user1.address, did);

      const user = await identity.users(user1.address);
      expect(user.wallet).to.equal(user1.address);
      expect(user.did).to.equal(did);
    });

    it("should allow admin to verify user", async () => {
      await expect(identity.verifyUser(user1.address))
        .to.emit(identity, "UserVerified")
        .withArgs(user1.address);

      const user = await identity.users(user1.address);
      expect(user.verified).to.be.true;
    });
  });

  describe("Credentials Contract", () => {
    it("should issue a single-signer credential", async () => {
      const cid = "QmTestCid";
      const schema = "ProofOfTest";
      const tx = await credentials.issue(user1.address, cid, schema, 0);
      const receipt = await tx.wait();
      const event = receipt.logs.find((log) =>
        log.fragment?.name === "CredentialIssued"
      );
      const [id, holder, issuer] = event?.args!;
      expect(holder).to.equal(user1.address);
      expect(issuer).to.equal(owner.address);

      const valid = await credentials.verify(id);
      expect(valid).to.be.true;
    });

    it("should initiate and approve multi-sig credential", async () => {
      await credentials.addIssuer(user2.address);

      const cid = "QmMultiCid";
      const schema = "ProofMulti";
      const needed = 2;
      const tx1 = await credentials.initiate(
        user1.address,
        cid,
        schema,
        0,
        needed
      );
      const receipt1 = await tx1.wait();
      const pendingEvent = receipt1.logs.find(
        (log) => log.fragment?.name === "PendingCreated"
      );
      const pendingId = pendingEvent?.args?.[0];

      await expect(credentials.connect(user2).approve(pendingId))
        .to.emit(credentials, "CredentialIssued")
        .withArgs(pendingId, user1.address, user2.address);

      const valid = await credentials.verify(pendingId);
      expect(valid).to.be.true;
    });

    it("should revoke credential with reason", async () => {
      const cid = "QmRevokeCid";
      const schema = "ProofRevoke";
      const tx = await credentials.issue(user1.address, cid, schema, 0);
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment?.name === "CredentialIssued"
      );
      const id = event?.args?.[0];

      await expect(credentials.revoke(id, "Test reason"))
        .to.emit(credentials, "CredentialRevoked")
        .withArgs(id, "Test reason");

      const valid = await credentials.verify(id);
      expect(valid).to.be.false;
    });
  });

  describe("Reporting Contract", () => {
    it("should submit and resolve a report", async () => {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Test report"));
      const category = ethers.keccak256(ethers.toUtf8Bytes("Spam"));

      const tx = await reporting
        .connect(user1)
        .submitReport(reportHash, category);
      const receipt = await tx.wait();
      const submitted = receipt.logs.find(
        (log) => log.fragment?.name === "ReportSubmitted"
      );
      const reportId = submitted?.args?.[0];

      const myReports = await reporting.connect(user1).getMyReports();
      const myReportIds = myReports.map((id: bigint) => Number(id));
      expect(myReportIds).to.include(Number(reportId));

      await expect(reporting.resolveReport(reportId))
        .to.emit(reporting, "ReportResolved")
        .withArgs(reportId, owner.address);

      const details = await reporting.reports(reportId);
      expect(details.resolved).to.be.true;
      expect(details.resolver).to.equal(owner.address);
    });
  });
});
