# SLIENTVox

Inspired by the voting systems in social media platforms like Instagram, where people vote for favorite influencers and creators, this project tackles issues like multiple fake account creations (e.g., using Gmail accounts) by leveraging advanced technologies such as Anonymous Aadhaar, Semaphore, and MACI contracts.

## Features

Voter Registration: Utilize Anonymous Aadhaar and Semaphore for secure voter registration.
Collusion-Resistant Voting: MACI contracts ensure votes remain private and collusion-proof.
Poll Management: Administrators can create and manage polls with flexible configurations.
Secure Voting: Anonymous and secure voting process with cutting-edge cryptographic techniques.
Results Display: View transparent and verifiable poll results post-voting, results are uploaded in walrus
Admin Dashboard: A user-friendly dashboard for monitoring and managing polls.

## Requirements

Ensure you have the following tools installed before you proceed:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

Jumpstart your development with these simple steps:

1. **Clone and Set Up the Project**

```bash
git clone https://github.com/yashgo0018/maci-wrapper.git
cd maci-wrapper
yarn install
```

2. **Download the zkeys for the maci circuits**

In your first terminal window, run:

```bash
yarn download-zkeys
```

3. **Update the environment variables**

Copy the env example files to env files

```bash
cp packages/hardhat/.env.example packages/hardhat/.env
cp packages/nextjs/.env.example packages/nextjs/.env.local
```

Update the values of the env variables in these new .env files

4. **Start a Local Ethereum Network**

In your first terminal window, run:

```bash
yarn chain
```

This initiates a local Ethereum network via Hardhat for development and testing purposes. Adjust the network settings in `hardhat.config.ts` as needed.

5. **Deploy Contracts**

In a second terminal, deploy your test contract with:

```bash
yarn deploy
```

Find the contract in `packages/hardhat/contracts`. This script deploys your contract to the local network, with customization available in `packages/hardhat/deploy`.

6. **Launch the NextJS Application**

In a third terminal, start the NextJS frontend:

```bash
yarn start
```

7. **Compute Results**

- Update `packages/hardhat/deploy-config.json` file, select the network, and in the `Poll` object, update `coordinatorPubkey` to the coordinator public key in the `packages/hardhat/coordinatorKeyPair.json`, and update `useQuadraticVoting` if you want to compute results for a non quadratic vote.
- Merge the poll, using `yarn hardhat merge --poll {poll id}`
- Generate proof, using `yarn hardhat prove --poll {poll id} --output-dir {proof ouput dir} --coordinator-private-key {coordinator private key} --tally-file {tally output file}`

Navigate to `http://localhost:3000` to interact with your dApp. Modify your app configuration in `packages/nextjs/scaffold.config.ts` and `packages/hardhat/constants.ts` as necessary.

The deployed contracts will be saved to the file `packages/hardhat/contractAddresses.json`, this file is compatible with maci cli.

The coordinator keys will be stored in the file `packages/hardhat/coordinatorKeyPair.json`.

## Contracts are deployed to Base

The initial voice credit proxy is deployed at 0xF7b71B3Ab8d3F264027fc73bFD3EBd47f2c59966
**_ ConstantInitialVoiceCreditProxy _**

Network: baseSepolia
contract address: 0xF7b71B3Ab8d3F264027fc73bFD3EBd47f2c59966

**_ ConstantInitialVoiceCreditProxy _**

The AnonAadhaarGatekeeper is deployed at 0xC6A6B9D209cb33308F02D460E78C2C532fDf40FB, with nullifier seed 1234

**_ Verifier _**

Network: baseSepolia
contract address: 0x8f5fDf528b1B144575E4B0344895D4923eD7EEfF

**_ PoseidonT3 _**

Network: baseSepolia
contract address: 0x19bfC336F4e1679ba241C82e2C7FAd45c2968291

---

**_ PoseidonT4 _**

Network: baseSepolia
contract address: 0x56A82dC664cCAc46b630541E92b61BdC69e44669

**_ PoseidonT5 _**

Network: baseSepolia
contract address: 0x39A5d385BE1295535049D748e95F1e9ca537cDC7

**_ PoseidonT6 _**

Network: baseSepolia
contract address: 0x3b49612278aDa563B98019B9154f3d9e4d1AAbc9

**_ PollFactory _**

Network: baseSepolia
contract address: 0x5e231C3e7d2162F72FA5870847A1d76e63094e1b

**_ MessageProcessorFactory _**

Network: baseSepolia
contract address: 0x6916EB149A497ed713F29450500CCCb3d3D0Ac55

**_ TallyFactory _**

Network: baseSepolia
contract address: 0xe3fd829858be0ceDEDCa4D1FF2Def2D9577084E2

**_ MACI _**

Network: baseSepolia
contract address: 0x4Ab59A215ceAEfaD243f51F94b1de37f6a50ed30

**_ VkRegistry _**

Network: baseSepolia
contract address: 0x51b70079601Bb6B67E1e7151cB86c215db9a3576

📝 Updated TypeScript contract definition file on ../nextjs/contracts/deployedContracts.ts
