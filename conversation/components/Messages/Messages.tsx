import React, { LegacyRef, MutableRefObject } from "react";
import * as sdk from "matrix-js-sdk";

export default function Messages({
  room,
  messageListRef,
}: {
  room: sdk.Room;
  messageListRef: MutableRefObject<HTMLDivElement | undefined>;
}) {
  return (
    <div
      className="relative w-full p-2 h-[40rem] flex flex-col-reverse overflow-y-auto"
      ref={messageListRef as LegacyRef<HTMLDivElement>}
    >
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
