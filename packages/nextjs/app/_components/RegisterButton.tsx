import { useEffect } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { useAuthContext } from "~~/contexts/AuthContext";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export default function RegisterButton() {
  const { keypair, isRegistered, generateKeypair } = useAuthContext();

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "MACIWrapper",
    functionName: "signUp",
    args: [keypair?.pubKey.asContractParam() as { x: bigint; y: bigint }, "0x", "0x"],
  });

  async function register() {
    if (!keypair) return;

    try {
      const { privateKey, publicKey, commitment } = new Identity();
      await writeAsync({ args: [keypair.pubKey.asContractParam() as { x: bigint; y: bigint }, "0x", "0x"] });
    } catch (err) {
      console.log(err);
    }
  }

  if (!keypair) {
    return (
      <button className="border border-slate-600 bg-primary px-3 py-2 rounded-lg font-bold" onClick={generateKeypair}>
        Login
      </button>
    );
  }

  if (isRegistered) return <div>Thanks for Registration</div>;

  return (
    <>
      (You are not registered yet)
      <button className="border border-slate-600 bg-primary px-3 py-2 rounded-lg font-bold" onClick={register}>
        Register
      </button>
    </>
  );
}
