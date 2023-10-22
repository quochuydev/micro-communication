import React from "react";
import * as sdk from "matrix-js-sdk";
import { LoginInfo } from "../ChatBox/ChatBox";

export default function RoomList(props: {
  rooms: sdk.Room[];
  loginInfo: LoginInfo;
  onSelectRoom: (room: sdk.Room) => void;
}) {
  const { rooms, loginInfo } = props;

  return (
    <div className="p-4">
      <ul>
        {[...rooms].map((room, index) => (
          <li key={index} className="flex items-center">
            <span>{room.name}</span>

            <span
              className={`block w-3 h-3 mx-2 rounded-full ${
                room.getMember(loginInfo.userId)?.membership === "join"
                  ? "bg-green-600"
                  : "bg-red-600"
              }`}
            />

            <button onClick={() => props.onSelectRoom(room)}>Select</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
