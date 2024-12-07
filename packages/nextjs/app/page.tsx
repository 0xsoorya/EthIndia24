"use client";

// import { useCallback, useEffect } from "react";
import { useEffect } from "react";
import RegisterButton from "./_components/RegisterButton";
import Anon from "./anonaadhar/anon";
import { useAnonAadhaar, useProver } from "@anon-aadhaar/react";
// import { Identity } from "@semaphore-protocol/identity";
import type { NextPage } from "next";
import { useAuthUserOnly } from "~~/hooks/useAuthUserOnly";

const Home: NextPage = () => {
  useAuthUserOnly({ inverted: true });
  const [, latestProof] = useProver();
  const [anonAadhaar] = useAnonAadhaar();

  useEffect(() => {
    // if (anonAadhaar.status === "logged-in") {
    console.log(anonAadhaar.status);
    if (latestProof) {
      console.log(latestProof);
    }
  }, [anonAadhaar, latestProof]);
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
        <div className="flex flex-col justify-center items-center mt-10 sm:w-2/3 mx-auto gap-x-10 gap-y-5 mb-10">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-center">Zero Knowledge, Maximum Voice</h1>

            <p className="text-lg mt-5 text-justify">
              Empowering seamless and intuitive voting experiences with customizable poll options, real-time updates,
              and fail-safe mechanisms—your perfect solution for modern engagement!
            </p>
            <p>
              Boost participation with visually appealing interfaces, robust accessibility features, and cross-platform
              compatibility. Track progress with live analytics and data visualizations, ensuring transparency and
              trust. Unlock advanced configurations like weighted votes, anonymous polling, and multi-language support
              to cater to diverse audiences. All backed by secure and scalable technology for unparalleled reliability
              in any scenario.
            </p>
            <div className="text-center flex justify-center gap-2">
              {/* <button
                  className="border border-slate-600 bg-primary px-3 py-2 rounded-lg font-bold"
                  onClick={createIdentity}
                >
                  Create Identity
                </button> */}
              <span>
                <RegisterButton />
              </span>
              <Anon />
            </div>
          </div>
          <div className="flex-1 mt-10">
            <div className="carousel carousel-end rounded-box">
              <div className="carousel-item">
                <img src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp" alt="Drink" />
              </div>
              <div className="carousel-item">
                <img src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp" alt="Drink" />
              </div>
              <div className="carousel-item">
                <img src="https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp" alt="Drink" />
              </div>
              <div className="carousel-item">
                <img src="https://img.daisyui.com/images/stock/photo-1494253109108-2e30c049369b.webp" alt="Drink" />
              </div>
              <div className="carousel-item">
                <img src="https://img.daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.webp" alt="Drink" />
              </div>
              <div className="carousel-item">
                <img src="https://img.daisyui.com/images/stock/photo-1559181567-c3190ca9959b.webp" alt="Drink" />
              </div>
              <div className="carousel-item">
                <img src="https://img.daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.webp" alt="Drink" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
