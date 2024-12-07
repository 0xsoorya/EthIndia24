"use client";

import { useEffect } from "react";
import { packGroth16Proof } from "@anon-aadhaar/core";
import { LogInWithAnonAadhaar, useAnonAadhaar, useProver } from "@anon-aadhaar/react";
import { AbiCoder } from "ethers";
import { useAuthContext } from "~~/contexts/AuthContext";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

// type HomeProps = {
//   setUseTestAadhaar: (state: boolean) => void;
//   useTestAadhaar: boolean;
// };

export default function Anon() {
  const [anonAadhaar] = useAnonAadhaar();
  const { keypair } = useAuthContext();
  const [, latestProof] = useProver();
  // Use the Country Identity hook to get the status of the user.
  console.log("anon", anonAadhaar, latestProof);
  const { writeAsync } = useScaffoldContractWrite({
    contractName: "MACIWrapper",
    functionName: "signUp",
    args: [keypair?.pubKey.asContractParam() as { x: bigint; y: bigint }, "0x", "0x"],
  });
  useEffect(() => {
    // if (anonAadhaar.status === "logged-in") {
    console.log(anonAadhaar.status);
    if (latestProof) {
      const packedGroth16Proof = packGroth16Proof(latestProof.proof.groth16Proof);
      const encodedData = AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "uint256", "uint256", "uint256[4]", "uint256[8]"],
        [
          latestProof.proof.nullifierSeed,
          latestProof.proof.nullifier,
          latestProof.proof.timestamp,
          latestProof.proof.signalHash,
          [latestProof.proof.ageAbove18, latestProof.proof.gender, latestProof.proof.pincode, latestProof.proof.state],
          packedGroth16Proof,
        ],
      );
      console.log(encodedData);
      writeAsync({ args: [keypair?.pubKey.asContractParam() as { x: bigint; y: bigint }, encodedData as any, "0x"] });
    }
  }, [anonAadhaar, latestProof]);

  return (
    <div className="flex w-full justify-center items-center align-middle">
      <LogInWithAnonAadhaar
        nullifierSeed={1234}
        fieldsToReveal={["revealAgeAbove18", "revealGender", "revealPinCode", "revealState"]}
      />
    </div>
  );
}
