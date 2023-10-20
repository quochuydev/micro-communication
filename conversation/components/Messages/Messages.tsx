import React, { useEffect } from "react";
import * as sdk from "matrix-js-sdk";

export default function Messages({
  room,
  client,
}: {
  room: sdk.Room;
  client: sdk.MatrixClient;
}) {
  useEffect(() => {
    if (!client) {
      return;
    }

    console.log("room", room);
    console.log("room", room.getLiveTimeline().getEvents());

    client.roomState(room.roomId).then((state) => {
      console.log(123123123, state);
    });
  }, [room]);

  return (
    <div className="relative w-full p-2 overflow-y-auto h-[40rem]">
      {!room && <p>Select a room</p>}

      <ul className="space-y-2">
        {room
          .getLiveTimeline()
          .getEvents()
          .map((message: any, i: any) => (
            <li className="flex justify-end" key={i}>
              <div className="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                <span className="block">{message.event.content.body}</span>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
