import React, { useState } from "react";

export default function Register(props: {
  isOpen: boolean;
  onSubmit: (params: { username: string; password: string }) => void;
  onClose: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!props.isOpen) return null;

  return (
    <>
      <div className="my-4 p-4">
        <p className="py-2">Register</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            props.onSubmit({ username, password });
          }}
        >
          <div className="rounded-md shadow-sm space-y-px">
            <div>
              <input
                autoFocus
                name="username"
                required
                className="appearance-none rounded-[8px] relative block w-full px-3 py-2 mb-[24px] border border-gray-300 placeholder-gray-300 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                // disabled={loading}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="relative">
              <input
                // autoFocus={!!defaultUsername}
                // type={hidePwd ? "password" : "text"}
                // disabled={loading}
                id="password"
                name="password"
                required
                className="appearance-none mb-[24px] rounded-[8px] relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-300 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="disabled:bg-gray-300 group relative py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>

          <button
            onClick={() => props.onClose()}
            className="disabled:bg-gray-300 group relative py-2 px-4 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </form>
      </div>
    </>
  );
}
