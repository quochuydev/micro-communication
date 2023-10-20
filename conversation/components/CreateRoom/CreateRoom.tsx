import React from "react";

export default function CreateRoom(props: {
  onCreateRoom: (name: string) => void;
}) {
  return (
    <>
      <span className="block mr-2 font-bold">
        <button onClick={() => props.onCreateRoom(`room name ${Date.now()}`)}>
          New room
        </button>
      </span>
    </>
  );
}
