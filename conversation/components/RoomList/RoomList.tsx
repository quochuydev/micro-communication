import React from "react";
import * as sdk from "matrix-js-sdk";

export default function RoomList(props: { rooms: sdk.Room[] }) {
  const { rooms = [] } = props;

  return (
    <div>
      <ul>
        {rooms.map((room, index) => (
          <li key={index}>
            <p>{room.roomId}</p>

            <button
              onClick={() => {
                //
              }}
            >
              Select
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
