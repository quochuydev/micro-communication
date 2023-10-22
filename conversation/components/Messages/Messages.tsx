import React, { LegacyRef, MutableRefObject } from "react";
import * as sdk from "matrix-js-sdk";
import { LoginInfo } from "../ChatBox/ChatBox";

export default function Messages({
  room,
  loginInfo,
  messageListRef,
}: {
  room: sdk.Room;
  loginInfo: LoginInfo;
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
          .map((event, index) => {
            if (event.event.type === sdk.EventType.RoomMessage) {
              return (
                <li
                  key={index}
                  className={`flex ${
                    event.event.sender === loginInfo.userId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                    <span className="block">
                      {event.event.type}: {event.event.content?.body}
                    </span>
                  </div>
                </li>
              );
            }

            return null;
          })}
      </ul>
    </div>
  );
}
