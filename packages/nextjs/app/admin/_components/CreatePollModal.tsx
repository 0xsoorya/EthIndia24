import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { LuCross } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import Modal from "~~/components/Modal";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { PollType } from "~~/types/poll";
import { EMode } from "~~/types/poll";
import { notification } from "~~/utils/scaffold-eth";
import { uploadFileToWalrus } from "~~/utils/walrus";

interface FileState {
  files: (File | null)[];
}

interface PollData {
  title: string;
  expiry: Date;
  pollType: PollType;
  mode: EMode;
  options: string[]; // This will store the file IDs or options as strings
}

export default function Example({
  show,
  setOpen,
  refetchPolls,
}: {
  show: boolean;
  setOpen: (value: boolean) => void;
  refetchPolls: () => void;
}) {
  const [pollData, setPollData] = useState<PollData>({
    title: "Dummy Title",
    expiry: new Date(),
    pollType: PollType.NOT_SELECTED,
    mode: EMode.QV,
    options: [],
  });
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [files, setFiles] = useState<FileState["files"]>([]); // Files array with File type

  const handlePollTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPollData({ ...pollData, pollType: parseInt(e.target.value) });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPollData({ ...pollData, title: e.target.value });
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPollData({ ...pollData, mode: e.target.value === "0" ? EMode.QV : EMode.NON_QV });
  };

  const handleEditTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleSaveTitleClick = () => {
    setIsEditingTitle(false);
  };

  // Add a new null entry for a new file
  const handleAddOption = () => {
    setFiles(prev => [...prev, null]);
  };

  // Remove the file at the given index
  const removeOption = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle file change, update the state with the selected file
  const handleFileChange = (index: number, file: File | null) => {
    const updatedFiles = [...files];
    updatedFiles[index] = file;
    setFiles(updatedFiles);
  };

  const duration = Math.round((pollData.expiry.getTime() - new Date().getTime()) / 1000);

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "MACIWrapper",
    functionName: "createPoll",
    args: [
      pollData.title,
      pollData.options || [],
      JSON.stringify({ pollType: pollData.pollType }),
      duration > 0 ? BigInt(duration) : 0n,
      pollData.mode,
    ],
  });

  const handleFileUpload = async () => {
    console.log("Uploading images");
    const pollOptions: string[] = [];
    for (const file of files) {
      try {
        const result = await uploadFileToWalrus(file);
        if (result) pollOptions.push(result as string);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    setPollData(prevState => ({
      ...prevState,
      options: pollOptions,
    }));
    notification.success("Upload completed");
  };

  async function onSubmit() {
    // validate the inputs
    if (pollData.options.length == 0) {
      notification.error("Option cannot be blank", { showCloseButton: false });
      return;
    }

    if (duration < 60) {
      // TODO: throw error that the expiry cannot be before atleast 1 min of creation
      notification.error("Expiry cannot be before atleast 1 min of creation", { showCloseButton: false });
      return;
    }

    if (pollData.pollType === PollType.NOT_SELECTED) {
      notification.error("Please select a poll type", { showCloseButton: false });
      return;
    }

    // save the poll data to ipfs or find another way for saving the poll type on the smart contract.

    try {
      await writeAsync();
      refetchPolls();
    } catch (err) {
      console.log(err);
    }

    setOpen(false);
  }

  return (
    <Modal show={show} setOpen={setOpen}>
      <div className="mt-3 text-center sm:mt-5 mb-6">
        <Dialog.Title as="h3" className="font-bold leading-6 text-2xl text-neutral-content">
          Create a Poll
        </Dialog.Title>
      </div>

      <div className="flex justify-between items-center mb-4">
        {isEditingTitle ? (
          <input
            type="text"
            className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none bg-white text-black"
            placeholder="Enter Poll Title"
            value={pollData.title}
            onChange={handleTitleChange}
          />
        ) : (
          <h2 className="text-xl font-semibold font-mono text-neutral-content mb-0 mt-2">{pollData.title}</h2>
        )}

        <label className="btn btn-circle swap swap-rotate ml-3 bg-primary hover:bg-primary-content text-primary-content hover:text-primary">
          <input
            type="checkbox"
            onChange={() => {
              if (isEditingTitle) {
                handleSaveTitleClick();
              } else {
                handleEditTitleClick();
              }
            }}
          />

          <div className="swap-off fill-current">
            <MdEdit size={25} />
          </div>

          <div className="swap-on fill-current">
            <RxCross2 size={25} />
          </div>
        </label>
      </div>

      {/* Datetime selector here */}
      <div className="mb-2 text-neutral-content">Select the expiry date</div>
      <input
        type="datetime-local"
        className="border bg-secondary text-neutral rounded-xl px-4 py-2 w-full focus:outline-none"
        value={pollData.expiry.toLocaleString("sv").replace(" ", "T").slice(0, -3)}
        onChange={e => setPollData({ ...pollData, expiry: new Date(e.target.value) })}
      />

      {/* Poll Type Selector Here */}
      <div className="mt-3 mb-2 text-neutral-content">Select the poll type</div>
      <select
        className="select bg-secondary text-neutral w-full rounded-xl"
        value={pollData.pollType}
        onChange={handlePollTypeChange}
      >
        <option disabled value={PollType.NOT_SELECTED}>
          Select Poll Type
        </option>
        <option value={PollType.SINGLE_VOTE}>Single Candidate Select</option>
        <option value={PollType.MULTIPLE_VOTE}>Multiple Candidate Select</option>
        <option value={PollType.WEIGHTED_MULTIPLE_VOTE}>Weighted-Multiple Candidate Select</option>
      </select>

      {/* Quadratic Vote or Non Quadratic Vote Selector Here */}
      <div className="mt-3 mb-2 text-neutral-content">Quadratic Vote or Non Quadratic Vote</div>
      <select
        className="select bg-secondary text-neutral w-full rounded-xl"
        value={pollData.mode}
        onChange={handleModeChange}
      >
        <option value={EMode.QV}>Quadratic Vote</option>
        <option value={EMode.NON_QV}>Non Quadratic Vote</option>
      </select>

      <div className="w-full h-[0.5px] bg-[#3647A4] shadow-2xl my-5" />

      <div className="mb-3 text-neutral-content">Create the options</div>

      {files.map((file, index) => (
        <div key={index} className="mb-2 flex flex-row items-center">
          <input
            type="file"
            onChange={e => handleFileChange(index, e.target.files ? e.target.files[0] : null)}
            accept="image/*"
            className="mr-4"
          />
          {file && (
            <img
              src={URL.createObjectURL(file)}
              alt={`Selected option ${index + 1}`}
              className="w-16 h-16 object-cover mr-4"
            />
          )}
          {index === files.length - 1 ? (
            <button
              className="btn btn-outline ml-4 text-primary hover:bg-primary hover:text-primary-content bg-primary-content"
              onClick={handleAddOption}
            >
              <LuCross size={20} />
            </button>
          ) : (
            <button
              className="btn btn-outline ml-4 text-primary hover:bg-primary hover:text-primary-content bg-primary-content"
              onClick={() => removeOption(index)}
            >
              <RxCross2 size={20} />
            </button>
          )}
        </div>
      ))}
      {files.length === 0 && (
        <button
          className="btn btn-outline mt-2 text-primary hover:bg-primary hover:text-primary-content bg-primary-content"
          onClick={handleAddOption}
        >
          Add Option
        </button>
      )}

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-primary text-primary-content px-3 py-2 font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
          onClick={onSubmit}
        >
          Create
        </button>
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-primary text-primary-content px-3 py-2 font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
          onClick={handleFileUpload}
        >
          Upload Images
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
