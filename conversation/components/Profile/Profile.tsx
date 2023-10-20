import React from "react";
import * as sdk from "matrix-js-sdk";

export default function CreateRoom({ client }: { client: sdk.MatrixClient }) {
  return (
    <>
      <img
        className="object-cover w-10 h-10 rounded-full"
        src="https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383__340.jpg"
        // src="#"
      />
      <span className="block ml-2 font-bold text-gray-600">Emma</span>
      {!!client && (
        <span className="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3"></span>
      )}
    </>
  );
}
