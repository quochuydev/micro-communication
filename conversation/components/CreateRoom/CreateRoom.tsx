import React from "react";
import * as sdk from "matrix-js-sdk";

export default function CreateRoom(props) {
  function createRoom() {
    console.log("createRoom");

    fetch(
      `http://localhost:8088/_matrix/client/r0/createRoom?access_token=${token}`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `room name ${Date.now()}`,
        }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
      });
  }

  return (
    <>
      <span className="block mr-2 font-bold">
        <button
          onClick={() => {
            //
          }}
        >
          New room
        </button>
      </span>
    </>
  );
}
