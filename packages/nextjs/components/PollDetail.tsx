"use client";

import { useEffect, useState } from "react";
import { genRandomSalt } from "maci-crypto";
import { Keypair, PCommand, PubKey } from "maci-domainobjs";
import { useContractRead, useContractWrite } from "wagmi";
import PollAbi from "~~/abi/Poll";
import VoteCard from "~~/components/card/VoteCard";
import { useAuthContext } from "~~/contexts/AuthContext";
import { useFetchPoll } from "~~/hooks/useFetchPoll";
import { getPollStatus } from "~~/hooks/useFetchPolls";
import { PollStatus, PollType } from "~~/types/poll";
import { defaultImages, timeLeft } from "~~/utils/general";
import { getDataFromPinata } from "~~/utils/pinata";
import { notification } from "~~/utils/scaffold-eth";
import { getFileFromWalrus } from "~~/utils/walrus";

export default function PollDetail({ id }: { id: bigint }) {
  const { data: poll, error, isLoading } = useFetchPoll(id);
  const [pollType, setPollType] = useState(PollType.NOT_SELECTED);

  const { keypair, stateIndex } = useAuthContext();

  const [votes, setVotes] = useState<{ index: number; votes: number }[]>([]);

  const [isVotesInvalid, setIsVotesInvalid] = useState<Record<number, boolean>>({});

  const isAnyInvalid = Object.values(isVotesInvalid).some(v => v);
  const [result, setResult] = useState<{ candidate: string; votes: number }[] | null>(null);
  const [status, setStatus] = useState<PollStatus>();
  const [voted, setVoted] = useState<boolean>(false);
  const [voting, setVoting] = useState<boolean>(false);

  useEffect(() => {
    if (!poll || !poll.metadata) {
      return;
    }

    try {
      const { pollType } = JSON.parse(poll.metadata);
      setPollType(pollType);
    } catch (err) {
      console.log("err", err);
    }

    if (poll.tallyJsonCID) {
      (async () => {
        try {
          const {
            results: { tally },
          } = await getDataFromPinata(poll.tallyJsonCID);
          if (poll.options.length > tally.length) {
            throw new Error("Invalid tally data");
          }
          const tallyCounts: number[] = tally.map((v: string) => Number(v)).slice(0, poll.options.length);
          const result = [];
          for (let i = 0; i < poll.options.length; i++) {
            const candidate = poll.options[i];
            const votes = tallyCounts[i];
            result.push({ candidate, votes });
          }
          result.sort((a, b) => b.votes - a.votes);
          setResult(result);
          console.log("data", result);
        } catch (err) {
          console.log("err", err);
        }
      })();
    }

    const statusUpdateInterval = setInterval(async () => {
      setStatus(getPollStatus(poll));
    }, 1000);

    return () => {
      clearInterval(statusUpdateInterval);
    };
  }, [poll]);

  const { data: coordinatorPubKeyResult } = useContractRead({
    abi: PollAbi,
    address: poll?.pollContracts.poll,
    functionName: "coordinatorPubKey",
  });

  const { writeAsync: publishMessage } = useContractWrite({
    abi: PollAbi,
    address: poll?.pollContracts.poll,
    functionName: "publishMessage",
  });

  const { writeAsync: publishMessageBatch } = useContractWrite({
    abi: PollAbi,
    address: poll?.pollContracts.poll,
    functionName: "publishMessageBatch",
  });

  const [coordinatorPubKey, setCoordinatorPubKey] = useState<PubKey>();

  useEffect(() => {
    if (!coordinatorPubKeyResult) {
      return;
    }

    const coordinatorPubKey_ = new PubKey([
      BigInt((coordinatorPubKeyResult as any)[0].toString()),
      BigInt((coordinatorPubKeyResult as any)[1].toString()),
    ]);

    setCoordinatorPubKey(coordinatorPubKey_);
  }, [coordinatorPubKeyResult]);

  const castVote = async () => {
    if (!poll || stateIndex == null || !coordinatorPubKey || !keypair) {
      notification.error("Error casting vote. Please refresh the page and try again.");
      return;
    }

    // check if the votes are valid
    if (isAnyInvalid) {
      notification.error("Please enter a valid number of votes");
      return;
    }

    // check if no votes are selected
    if (votes.length === 0) {
      notification.error("Please select at least one option to vote");
      return;
    }

    // check if the poll is closed
    if (status !== PollStatus.OPEN) {
      notification.error("Voting is closed for this poll");
      return;
    }

    setVoting(true);

    const votesToMessage = votes.map((v, i) =>
      getMessageAndEncKeyPair(
        stateIndex,
        poll.id,
        BigInt(v.index),
        BigInt(v.votes),
        BigInt(votes.length - i),
        coordinatorPubKey,
        keypair,
      ),
    );

    try {
      if (votesToMessage.length === 1) {
        await publishMessage({
          args: [
            votesToMessage[0].message.asContractParam() as unknown as {
              data: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
            },
            votesToMessage[0].encKeyPair.pubKey.asContractParam() as unknown as { x: bigint; y: bigint },
          ],
        });
      } else {
        await publishMessageBatch({
          args: [
            votesToMessage.map(
              v =>
                v.message.asContractParam() as unknown as {
                  data: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
                },
            ),
            votesToMessage.map(v => v.encKeyPair.pubKey.asContractParam() as { x: bigint; y: bigint }),
          ],
        });
      }

      notification.success("Vote casted successfully");
      setVoted(true);
    } catch (err) {
      console.log("err", err);
      notification.error("Casting vote failed, please try again ");
    } finally {
      setVoting(false);
    }
  };

  function getMessageAndEncKeyPair(
    stateIndex: bigint,
    pollIndex: bigint,
    candidateIndex: bigint,
    weight: bigint,
    nonce: bigint,
    coordinatorPubKey: PubKey,
    keypair: Keypair,
  ) {
    const command: PCommand = new PCommand(
      stateIndex,
      keypair.pubKey,
      candidateIndex,
      weight,
      nonce,
      pollIndex,
      genRandomSalt(),
    );

    const signature = command.sign(keypair.privKey);

    const encKeyPair = new Keypair();

    const message = command.encrypt(signature, Keypair.genEcdhSharedKey(encKeyPair.privKey, coordinatorPubKey));

    return { message, encKeyPair };
  }

  function voteUpdated(index: number, checked: boolean, voteCounts: number) {
    if (pollType === PollType.SINGLE_VOTE) {
      if (checked) {
        setVotes([{ index, votes: voteCounts }]);
      }
      return;
    }

    if (checked) {
      setVotes([...votes.filter(v => v.index !== index), { index, votes: voteCounts }]);
    } else {
      setVotes(votes.filter(v => v.index !== index));
    }
  }

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Poll not found</div>;

  return (
    <div className="container mx-auto pt-10">
      <div className="flex h-full flex-col md:w-2/3 lg:w-1/2 mx-auto">
        <div className="flex flex-row items-center my-5">
          <div className="text-2xl font-bold ">
            Vote for {poll?.name}
            {status === PollStatus.CLOSED ? (
              " (Closed)"
            ) : (
              <p className="text-sm text-gray-500 mt-1">Time Left: {timeLeft(poll?.endTime as unknown as string)}</p>
            )}
          </div>
        </div>
        {voted ? (
          <div>
            <p className="font-bold">Voted:</p>
            <ul>
              {votes.map((vote, index) => (
                <li key={vote.index} className="bg-primary flex w-full px-2 py-2 rounded-lg mb-2 gap-2">
                  <img
                    src={getFileFromWalrus(poll?.options[vote.index] || defaultImages[index])}
                    height={48}
                    width={48}
                    alt="Candidate image"
                  />
                  {vote.votes} votes
                </li>
              ))}
            </ul>
            {status === PollStatus.OPEN && (
              <div className={`mt-2 shadow-2xl`}>
                <button
                  onClick={() => setVoted(false)}
                  className="hover:border-black border-2 border-accent w-full text-lg text-center bg-accent py-3 rounded-xl font-bold mt-4"
                >
                  Change Vote
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4">
              {poll?.options.map((candidate, index) => (
                <VoteCard
                  key={index}
                  pollOpen={status === PollStatus.OPEN}
                  index={index}
                  candidate={candidate}
                  clicked={false}
                  currentVotes={votes.find(v => v.index === index)?.votes}
                  pollType={pollType}
                  onChange={(checked, votes) => voteUpdated(index, checked, votes)}
                  isInvalid={Boolean(isVotesInvalid[index])}
                  setIsInvalid={status => setIsVotesInvalid({ ...isVotesInvalid, [index]: status })}
                />
              ))}
            </div>

            {status === PollStatus.OPEN && (
              <div className={`mt-2 shadow-2xl`}>
                <button
                  onClick={castVote}
                  disabled={voting}
                  className="hover:border-black border-2 border-accent w-full text-lg text-center bg-accent py-3 rounded-xl font-bold disabled:cursor-not-allowed disabled:border-none"
                >
                  Vote Now
                </button>
              </div>
            )}
          </>
        )}

        {result && (
          <div className="mt-5">
            <div className="text-2xl font-bold">Results</div>
            <div className="mt-3">
              <table className="border-separate w-full mt-7 mb-4">
                <thead>
                  <tr className="text-lg font-extralight">
                    <th className="border border-slate-600 bg-primary">Rank</th>
                    <th className="border border-slate-600 bg-primary">Candidate</th>
                    <th className="border border-slate-600 bg-primary">Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((r, i) => (
                    <tr key={i} className="text-center">
                      <td>{i + 1}</td>
                      <td>{r.candidate}</td>
                      <td>{r.votes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
