import React from "react";

export default function Messages(props) {
  const { room } = props;

  return (
    <div className="relative w-full p-2 overflow-y-auto h-[40rem]">
      {!room && <p>Select a room</p>}

      <ul className="space-y-2">
        {JSON.stringify(room?.messages?.length)}

        {room?.messages.map((message: any, i: any) => (
          <li className="flex justify-end" key={i}>
            <div className="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
              <span className="block">{message?.content?.body}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
