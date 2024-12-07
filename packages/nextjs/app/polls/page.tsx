"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuFrown, LuSmile } from "react-icons/lu";
import Paginator from "~~/components/Paginator";
import HoverBorderCard from "~~/components/card/HoverBorderCard";
import { useAuthUserOnly } from "~~/hooks/useAuthUserOnly";
import { useFetchPolls } from "~~/hooks/useFetchPolls";
import { useTotalPages } from "~~/hooks/useTotalPages";
import { timeLeft } from "~~/utils/general";
import { getFileFromWalrus } from "~~/utils/walrus";

export default function Polls() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const { totalPolls, polls } = useFetchPolls(currentPage, limit);
  const totalPages = useTotalPages(totalPolls, limit);
  useAuthUserOnly({});

  //console.log(polls);

  const router = useRouter();

  return (
    <div className="container mx-auto pt-10">
      <div className="flex mb-5">
        <div className="flex-1 text-2xl">Polls</div>
      </div>
      {polls !== undefined ? (
        polls.length !== 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {polls.map(poll => (
                <HoverBorderCard key={poll.id} showArrow={true} click={() => router.push(`/polls/${poll.id}`)}>
                  <div className="flex flex-col">
                    {/* Poll Name and Status */}
                    <div className="flex ">
                      <h1 className="text-lg font-bold">{poll.name}</h1>
                      {poll.status === "Open" ? (
                        <LuSmile className="text-green-600 text-xl" title="Open" />
                      ) : (
                        <LuFrown className="text-red-600 text-xl" title="Closed" />
                      )}
                    </div>

                    {/* Candidates Count */}
                    <h2 className="text-sm">{poll.options.length} Candidates</h2>

                    {/* Expiry */}
                    <p className="text-sm text-gray-500 mt-1">
                      {poll.status === "Open" ? `Time Left: ${timeLeft(poll.endTime.toString())}` : "Poll Closed"}
                    </p>

                    {/* Candidates Images */}
                    <div className="flex gap-2">
                      {poll.options.slice(0, 3).map(p => (
                        <img
                          src={getFileFromWalrus(p)}
                          key={p}
                          alt="Candidate"
                          className="h-32 w-32 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                </HoverBorderCard>
              ))}
            </div>
            {totalPages > 1 && (
              <Paginator currentPage={currentPage} totalPages={totalPages} setPageNumber={setCurrentPage} />
            )}
          </>
        ) : (
          <div>No polls found</div>
        )
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
