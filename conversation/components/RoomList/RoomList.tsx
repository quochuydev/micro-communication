import React from "react";
import * as sdk from "matrix-js-sdk";

export default function RoomList(props: {
  rooms: sdk.Room[];
  onSelectRoom: (room: sdk.Room) => void;
}) {
  const { rooms } = props;

  return (
    <div>
      <ul>
        {[...rooms].map((room, index) => (
          <li key={index}>
            <p>{room.roomId}</p>

            <button onClick={() => props.onSelectRoom(room)}>Select</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
