import React, { useEffect, useState } from "react";

export default function Home() {
  const [token, setToken] = useState();
  const [roomId, setRoomId] = useState();
  const [rooms, setRooms] = useState<any>([]);
  const [roomEvents, setRoomEvents] = useState();
  const [syncData, setSyncData] = useState();
  const [selectedRoomId, setSelectedRoomId] = useState();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  function register() {
    console.log("register");

    fetch("https://admin.local/_matrix/client/r0/register", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin",
        auth: {
          type: "m.login.dummy",
        },
      }),
    })
      .then((res) => res.json())
      .then((res) => console.log(res));
  }

  function login() {
    console.log("login");

    fetch("https://admin.local/_matrix/client/r0/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: "admin",
        password: "admin",
        type: "m.login.password",
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setToken(res.access_token);
      });
  }

  function sync() {
    console.log("sync");

    fetch("https://admin.local/_matrix/client/r0/sync?access_token=" + token)
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setSyncData(res);

        const room = res?.rooms?.join || {};

        const roomsData = Object.keys(room).map((roomId) => ({
          roomId,
          messages: room[roomId]?.timeline?.events.filter(
            (event: any) => event.type === "m.room.message"
          ),
        }));

        console.log({ roomsData });

        setRooms(roomsData);
      });
  }

  function createRoom() {
    console.log("createRoom");

    fetch(
      `https://admin.local/_matrix/client/r0/createRoom?access_token=${token}`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `room  name ${Date.now()}`,
        }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setRoomId(res.room_id);
      });
  }

  function sendMessage() {
    console.log("sendMessage");

    fetch(
      `https://admin.local/_matrix/client/r0/rooms/${selectedRoomId}/send/m.room.message?access_token=${token}&room_alias_name=tutorial`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          msgtype: "m.text",
          body: "hello",
          event_id: "YUwRidLecu",
        }),
      }
    )
      .then((res) => res.json())
      .then((res) => console.log(res));
  }

  function getRoomEvents() {
    console.log("login");

    fetch("https://admin.local/_matrix/client/r0/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: "admin",
        password: "admin",
        type: "m.login.password",
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setToken(res.access_token);
      });
  }

  useEffect(() => {
    sync();
  }, []);

  useEffect(() => {
    if (!selectedRoomId) {
      return;
    }

    fetch(
      `https://admin.local/_matrix/client/r0/rooms/${selectedRoomId}/state?access_token=${token}`
    )
      .then((res) => res.json())
      .then((res) => {
        console.log("selectedRoomId", res);
      });
  }, [selectedRoomId]);

  return (
    <div className="container mx-auto">
      <button onClick={register}>register</button>|
      <button onClick={sync}>sync</button>|
      <button onClick={login}>login</button>|
      <button onClick={createRoom}>createRoom</button>|
      <button onClick={getRoomEvents}>getRoomEvents</button>|
      <button onClick={sendMessage}>sendMessage</button>
      <p>{token}</p>
      <div className="max-w-2xl border rounded">
        <div>
          <ul>
            {rooms.map((room: any, i: number) => (
              <li key={i}>
                {room.roomId}{" "}
                <button
                  onClick={() => {
                    setSelectedRoomId(room.roomId);
                    setSelectedRoom(room);
                  }}
                >
                  Select
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="w-full">
            <div className="relative flex items-center p-3 border-b border-gray-300">
              <img
                className="object-cover w-10 h-10 rounded-full"
                src="https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383__340.jpg"
                alt="username"
              />
              <span className="block ml-2 font-bold text-gray-600">Emma</span>
              <span className="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3"></span>
            </div>
            <div className="relative w-full p-6 overflow-y-auto h-[40rem]">
              {!selectedRoom && <p>Select a room</p>}

              <ul className="space-y-2">
                {selectedRoom?.messages.map((message: any, i: any) => (
                  <li className="flex justify-end" key={i}>
                    <div className="relative max-w-xl px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
                      <span className="block">{message?.content?.body}</span>
                    </div>
                  </li>
                ))}

                {/* <li className="flex justify-start" key={i}>
                  <div className="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
                    <span className="block">{message?.content?.body}</span>
                  </div>
                </li> */}
              </ul>
            </div>
            <div className="flex items-center justify-between w-full p-3 border-t border-gray-300">
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Message"
                className="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
                name="message"
                required
                value={1123123}
              />
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
              <button type="submit">
                <svg
                  className="w-5 h-5 text-gray-500 origin-center transform rotate-90"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
