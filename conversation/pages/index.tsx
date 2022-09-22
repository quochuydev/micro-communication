import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import VideoCall from "../components/VideoCall";

export default function Home() {
  const [token, setToken] = useState();
  const [roomId, setRoomId] = useState();
  const [rooms, setRooms] = useState<any>([]);
  const [selectedRoomId, setSelectedRoomId] = useState();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  async function register() {
    console.log("register");

    const deviceId = uuidv4();

    await fetch("https://careprovider.local/_matrix/client/r0/register", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin",
        device_id: deviceId,
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

    fetch("https://careprovider.local/_matrix/client/r0/login", {
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

        localStorage.setItem("deviceId", res.device_id);
        localStorage.setItem("userId", res.user_id);
      });
  }

  async function sync() {
    console.log("sync");

    fetch(
      "https://careprovider.local/_matrix/client/r0/sync?access_token=" + token
    )
      .then((res) => res.json())
      .then(async (res) => {
        const room = res?.rooms?.join || {};
        console.log("res", res);
        console.log(room);

        const roomsData = Object.keys(room).map((roomId) => ({
          roomId,
          messages: room[roomId]?.timeline?.events.filter(
            (event: any) =>
              event.type === "m.room.message" ||
              event.type === "m.room.encrypted"
          ),
        }));

        const olm = global.Olm;
        await olm.init();

        const olmInboundGroupSession = new olm.InboundGroupSession();
        const olmAccount = new olm.Account();

        const sessionByInbound = olmInboundGroupSession.session_id();

        const deviceId = localStorage.getItem("deviceId");
        const userId = localStorage.getItem("userId");
        const sessionId = localStorage.getItem("sessionId");
        const firstKnownIndex = olmInboundGroupSession.first_known_index();

        let currentDeviceString = localStorage.getItem("currentDevice");

        let currentDevice = !!currentDeviceString
          ? JSON.parse(currentDeviceString)
          : null;

        console.log("currentDevice", currentDevice);
        console.log("sessionByInbound", sessionByInbound);
        console.log("sessionId", sessionId);
        console.log("firstKnownIndex", firstKnownIndex);
        // console.log("pickedInboundGroupSession", pickedInboundGroupSession);

        // const maxNumberOfOneTimeKeys = olmAccount.max_number_of_one_time_keys();
        // console.log({ maxNumberOfOneTimeKeys });

        await olmAccount.generate_one_time_keys(20);

        const oneTimeKeys = JSON.parse(olmAccount.one_time_keys());

        console.log({ oneTimeKeys });

        const _signOneTimeKeys: any = {};

        for (const [keyName, value] of Object.entries(oneTimeKeys.curve25519)) {
          const signedKey = olmAccount.sign(JSON.stringify({ key: value }));

          _signOneTimeKeys[`signed_curve25519:${keyName}`] = {
            key: value,
            signatures: {
              [userId as string]: {
                [`ed25519:${deviceId}`]: signedKey,
              },
            },
          };
        }

        console.log("_signOneTimeKeys", _signOneTimeKeys);

        await fetch(
          `https://careprovider.local/_matrix/client/r0/keys/upload?access_token=${token}`,
          {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              one_time_keys: _signOneTimeKeys,
            }),
          }
        ).then((res) => res.json());

        await olmAccount.mark_keys_as_published();

        const resultRoomsData = await Promise.all(
          roomsData.map(async (e) => ({
            ...e,
            messages: await Promise.all(
              e.messages.map(async (message: any, index: number) => {
                try {
                  if (message.type === "m.room.encrypted") {
                    let pickedInboundGroupSession = localStorage.getItem(
                      "pickedInboundGroupSession"
                    );

                    if (pickedInboundGroupSession) {
                      olmInboundGroupSession.unpickle(
                        "DEFAULT_KEY",
                        pickedInboundGroupSession
                      );
                    }

                    const senderCurve25519Key = currentDevice.identityKey;

                    console.log({ senderCurve25519Key });

                    // TODO

                    const plaintext = olmInboundGroupSession.decrypt(
                      message.content.ciphertext
                    );

                    console.log(plaintext);

                    localStorage.setItem(
                      "pickedInboundGroupSession",
                      olmInboundGroupSession.pickle("DEFAULT_KEY")
                    );

                    return {
                      content: {
                        index,
                        body: "ciphertext",
                      },
                    };
                  }

                  return {
                    content: {
                      index,
                      body: "m.text",
                    },
                  };
                } catch (error: any) {
                  return {
                    content: {
                      index,
                      body: JSON.stringify(error.message),
                    },
                  };
                }
              })
            ),
          }))
        );

        console.log({ resultRoomsData });

        olmInboundGroupSession.free();

        setRooms(resultRoomsData);
      });
  }

  function createRoom() {
    console.log("createRoom");

    fetch(
      `https://careprovider.local/_matrix/client/r0/createRoom?access_token=${token}`,
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

  async function encrypt({ roomId, plaintext }: any) {
    const deviceId = localStorage.getItem("deviceId");
    const userId = localStorage.getItem("userId");

    const olm = global.Olm;
    await olm.init();

    const olmAccount = new olm.Account();

    const { ed25519, curve25519 } = JSON.parse(olmAccount.identity_keys());

    let sessionId = localStorage.getItem("sessionId") as string;

    if (!sessionId) {
      sessionId = uuidv4();

      localStorage.setItem("sessionId", sessionId);
    }

    let currentDeviceString = localStorage.getItem("currentDevice");

    let currentDevice = !!currentDeviceString
      ? JSON.parse(currentDeviceString)
      : null;

    if (!currentDevice) {
      currentDevice = {
        id: deviceId,
        fingerprintKey: ed25519,
        identityKey: curve25519,
        verification: 1,
      };

      localStorage.setItem("currentDevice", JSON.stringify(currentDevice));
    }

    console.log({ deviceId, ed25519, curve25519 });

    console.log({ sessionId });

    const olmOutboundGroupSession = new olm.OutboundGroupSession();

    const ciphertext = olmOutboundGroupSession.encrypt(plaintext);

    const data = {
      room_id: roomId,
      session_id: sessionId,
      device_id: currentDevice.id,
      sender_key: currentDevice.identityKey,
      algorithm: "m.megolm.v1.aes-sha2",
      ciphertext,
    };

    console.log(data);

    return data;
  }

  async function sendMessage() {
    console.log("sendMessage");

    // fetch(
    //   `https://careprovider.local/_matrix/client/r0/rooms/${selectedRoomId}/send/m.room.message?access_token=${token}&room_alias_name=tutorial`,
    //   {
    //     method: "put",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       msgtype: "m.text",
    //       body: "hello",
    //       event_id: Date.now(),
    //     }),
    //   }
    // )
    //   .then((res) => res.json())
    //   .then((res) => console.log(res));

    const transactionId = uuidv4();

    fetch(
      `https://careprovider.local/_matrix/client/r0/rooms/${selectedRoomId}/send/${"m.room.encrypted"}/${transactionId}?access_token=${token}&room_alias_name=tutorial`,
      {
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          await encrypt({
            roomId: selectedRoomId,
            plaintext: "hello sent a encrypted message",
          })
        ),
      }
    )
      .then((res) => res.json())
      .then((res) => console.log(res));
  }

  function getRoomEvents() {
    console.log("login");

    fetch("https://careprovider.local/_matrix/client/r0/login", {
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

    // fetch(
    //   `https://careprovider.local/_matrix/client/r0/rooms/${selectedRoomId}/state?access_token=${token}`
    // ).then((res) => res.json());

    // sync();
  }, [selectedRoomId]);

  return (
    <div className="container mx-auto">
      <br />
      <VideoCall />
      <br />
      <br />
      <br />
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
                {room.roomId}
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
                {JSON.stringify(selectedRoom?.messages?.length)}

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
