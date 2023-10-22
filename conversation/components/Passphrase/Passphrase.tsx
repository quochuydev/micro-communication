import React, { useState } from "react";

export default function Passphrase(props: {
  onSubmit: (passphrase: string) => void;
  onClose: () => void;
}) {
  const [passphrase, setPassphrase] = useState(`123456`);

  return (
    <div className="p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          props.onSubmit(passphrase);
        }}
      >
        <div className="rounded-md shadow-sm space-y-px">
          <div>
            <input
              name="roomName"
              placeholder="roomName"
              autoFocus
              required
              className="appearance-none rounded-[8px] relative block w-full px-3 py-2 mb-[24px] border border-gray-300 placeholder-gray-300 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="disabled:bg-gray-300 group relative py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
