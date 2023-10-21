import React from "react";
import ChatBox from "../components/ChatBox/ChatBox";

export default function Home() {
  return (
    <div className="flex">
      <ChatBox index={0} />
      <ChatBox index={1} />
    </div>
  );
}
