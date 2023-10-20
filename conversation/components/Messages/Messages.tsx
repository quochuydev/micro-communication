import React, { useEffect, useReducer, useState } from "react";
import * as sdk from "matrix-js-sdk";

export default function Messages({
  room,
  client,
}: {
  room: sdk.Room;
  client: sdk.MatrixClient;
}) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    client.on("Room.timeline", function (event) {
      if (event.event.type === "m.room.message") {
        forceUpdate();
      }
    });
  }, [room]);

  return (
    <div className="relative w-full p-2 overflow-y-auto h-[40rem]">
      {!room && <p>Select a room</p>}

      <ul className="space-y-2">
        {room
          .getLiveTimeline()
          .getEvents()
          .filter((event) => event.event.type === "m.room.message")
          .map((event: any, i: any) => (
            <li className="flex justify-end" key={i}>
              <div className="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                <span className="block">{event.event.content.body}</span>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
