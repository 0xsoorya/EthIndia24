import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
//import { AnonAadhaarVerifierContractName } from "../constants";
import { MockAnonAadhaar } from "../typechain-types/maci-contracts/contracts/mocks";
//import type { MockAnonAadhaar } from "../typechain-types";

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (process.env.GATEKEEPER_CONTRACT_NAME === "AnonAadhaarGatekeeper") {
    const { deployer } = await hre.getNamedAccounts();

    // const anonVerifier = await hre.deployments.deploy("AnonVerifier", {
    //   from: deployer,
    //   args: [],
    //   log: true,
    //   autoMine: true,
    // });
    // console.log("verifier address", anonVerifier.address);

    // const mockAnonAadhaar = await hre.deployments.deploy("AnonAadhaar", {
    //   from: deployer,
    //   args: [anonVerifier.address, 123],
    //   log: true,
    //   autoMine: true,
    // });

    const mockAnonAadhaar = await hre.deployments.deploy(MockAnonAadhaar, {
      from: deployer,
      args: [],
      log: true,
      autoMine: true,
    });

    // const demo = await ethers.getContractAt("AnonAadhaar", "0x638A246F0Ec8883eF68280293FFE8Cfbabe61B44");
    // const tx = await demo.verifyAnonAadhaarProof(
    //   "7946664694698614794431553425553810756961743235367295886353548733878558886762",
    //   1234,
    //   Math.floor(new Date().getTime() / 1000) - 2 * 60 * 60,
    //   "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    //   ["1", "77", "110051", "452723500356"],
    //   ["0", "1", "2", "3", "4", "5", "6", "7"],
    // );

    // console.log(tx);

    const contractName = "AnonAadhaarGatekeeper";

    console.log("Deploying AnonAadhaar contracts...");

    // Deploy AnonAadhaarVerifier contract
    // const anonAadhaarVerifier = await hre.deployments.deploy(AnonAadhaarVerifierContractName, {
    //   from: deployer,
    //   args: [],
    //   log: true,
    //   autoMine: true,
    // });

    // Generate a random nullifier seed
    const nullifierSeed = "1234";

    // Deploy AnonAadhaarGatekeeper contract
    await hre.deployments.deploy(contractName, {
      from: deployer,
      args: [mockAnonAadhaar.address, nullifierSeed],
      log: true,
      autoMine: true,
    });

    const gatekeeper = await hre.ethers.getContract(contractName, deployer);
    console.log(
      `The AnonAadhaarGatekeeper is deployed at ${await gatekeeper.getAddress()}, with nullifier seed ${nullifierSeed}`,
    );
  } else {
    console.log("Skipping AnonAadhaarGatekeeper deployment");
  }
};

export default deployContracts;

deployContracts.tags = ["AnonAadhaarGatekeeper"];
