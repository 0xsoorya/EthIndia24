"use client";

// import { useCallback, useEffect } from "react";
import Image from "next/image";
import RegisterButton from "./_components/RegisterButton";
// import { Identity } from "@semaphore-protocol/identity";
import type { NextPage } from "next";
import HeroImage from "~~/assets/private_voting.png";
import { useAuthUserOnly } from "~~/hooks/useAuthUserOnly";

const Home: NextPage = () => {
  useAuthUserOnly({ inverted: true });

  // useEffect(() => {
  //   const privateKey = localStorage.getItem("identity");

  //   if (privateKey) {
  //     const identity = Identity.import(privateKey);

  //     console.log("Your Semaphore identity has been retrieved from the browser cache 👌🏽");
  //   } else {
  //     console.log("Create your Semaphore identity 👆🏽");
  //   }
  // });

  // const createIdentity = useCallback(async () => {
  //   const identity = new Identity();

  //   localStorage.setItem("identity", identity.export());

  //   console.log("Your new Semaphore identity has just been created 🎉");
  // });

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-4xl font-bold text-center">Private Voting Starter Kit with MACI</h1>

          <div className="flex flex-col-reverse md:flex-row justify-center items-center mt-10 sm:w-2/3 mx-auto gap-x-10 gap-y-5 mb-10">
            <div className="flex-1">
              <p className="text-lg mt-5 text-justify">
                This starter kit is designed to help you get started with private voting using the Minimal
                Anti-Collusion Infrastructure (MACI).
              </p>
              <div className="text-center">
                {/* <button
                  className="border border-slate-600 bg-primary px-3 py-2 rounded-lg font-bold"
                  onClick={createIdentity}
                >
                  Create Identity
                </button> */}
                <RegisterButton />
              </div>
            </div>
            <div className="flex-1">
              <Image src={HeroImage} alt="MACI" className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
