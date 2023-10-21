import React from "react";
import ChatBox from "../components/ChatBox/ChatBox";

export default function Home() {
  return (
    <div className="flex">
      <ChatBox box={0} />
      <ChatBox box={1} />
    </div>
  );
}
