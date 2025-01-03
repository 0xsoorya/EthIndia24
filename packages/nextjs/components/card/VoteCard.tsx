import { useRef, useState } from "react";
import { PollType } from "~~/types/poll";
import { getFileFromWalrus } from "~~/utils/walrus";

type VoteCardProps = {
  index: number;
  candidate: string;
  clicked: boolean;
  pollType: PollType;
  onChange: (checked: boolean, votes: number) => void;
  setIsInvalid: (value: boolean) => void;
  isInvalid: boolean;
  pollOpen: boolean;
  currentVotes?: number;
};

const VoteCard = ({
  index,
  candidate,
  onChange,
  pollType,
  isInvalid,
  setIsInvalid,
  pollOpen,
  currentVotes,
}: VoteCardProps) => {
  const [selected, setSelected] = useState(currentVotes && currentVotes > 0 ? true : false);
  const [votes, setVotes] = useState(currentVotes || 0);
  const votesFieldRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="bg-secondary flex items-center w-full px-4 py-2 rounded-lg">
        {pollOpen && (
          <input
            type={pollType === PollType.SINGLE_VOTE ? "radio" : "checkbox"}
            className="mr-4"
            value={index}
            checked={selected}
            onChange={e => {
              console.log(e.target.checked);
              setSelected(e.target.checked);
              if (e.target.checked) {
                switch (pollType) {
                  case PollType.SINGLE_VOTE:
                    onChange(true, 1);
                    break;
                  case PollType.MULTIPLE_VOTE:
                    onChange(true, 1);
                    break;
                  case PollType.WEIGHTED_MULTIPLE_VOTE:
                    if (votes) {
                      onChange(true, votes);
                    } else {
                      setIsInvalid(true);
                    }
                    break;
                }
              } else {
                onChange(false, 0);
                setIsInvalid(false);
                setVotes(0);
                if (votesFieldRef.current) {
                  votesFieldRef.current.value = "";
                }
              }
            }}
            name={pollType === PollType.SINGLE_VOTE ? "candidate-votes" : `candidate-votes-${index}`}
          />
        )}

        <img
          className="w-24 h-24 object-cover rounded-lg mr-4"
          src={getFileFromWalrus(candidate)}
          alt="Blob image"
          onError={() => {
            console.log("Blob not found. Please try a valid blob id.");
          }}
        />

        <div className="flex-1">
          <p className="text-primary-content">{candidate}</p>
        </div>
      </div>

      {pollOpen && pollType === PollType.WEIGHTED_MULTIPLE_VOTE && (
        <input
          ref={votesFieldRef}
          type="number"
          className={
            "border border-slate-600 bg-primary text-primary-content placeholder:text-accent-content placeholder:font-light rounded-lg px-2 py-2 ml-2 w-20" +
            (isInvalid ? " border-red-500" : "")
          }
          disabled={!selected}
          placeholder="Votes"
          min={0}
          step={1}
          defaultValue={currentVotes || ""}
          onChange={function (e) {
            if (
              Number(e.currentTarget.value) < 0 ||
              (selected && (e.currentTarget.value === "" || Number(e.currentTarget.value) == 0))
            ) {
              setIsInvalid(true);
            } else {
              setIsInvalid(false);
              setVotes(Number(e.currentTarget.value));
              onChange(selected, Number(e.currentTarget.value));
            }
          }}
        />
      )}
    </>
  );
};

export default VoteCard;
