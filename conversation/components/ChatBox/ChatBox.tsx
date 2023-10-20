import React, { useEffect, useRef, useState } from "react";
import RoomList from "../RoomList/RoomList";
import ChatInput from "../ChatInput/ChatInput";
import Register from "../Register/Register";
import Login from "../Login/Login";
import CreateRoom from "../CreateRoom/CreateRoom";
import * as sdk from "matrix-js-sdk";
import Profile from "../Profile/Profile";
import Messages from "../Messages/Messages";
import Toast, { ToastType } from "../Toast/Toast";
import { sendRequest } from "../../helpers/api-caller";

export type LoginInfo = {
  accessToken: string;
  userId: string;
};

export default function ChatBox() {
  const olm = global.Olm;
  const [client, setClient] = useState<sdk.MatrixClient>();
  const [rooms, setRooms] = useState<sdk.Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<sdk.Room>();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [showRoomList, setShowRoomList] = useState(false);
  const [loginInfo, setLoginInfo] = useState<LoginInfo>();

  const toastRef = useRef<ToastType>();

  useEffect(() => {
    console.log(localStorage.getItem("accessToken"));
    console.log(localStorage.getItem("userId"));

    if (localStorage.getItem("accessToken") && localStorage.getItem("userId")) {
      setLoginInfo({
        accessToken: localStorage.getItem("accessToken") as string,
        userId: localStorage.getItem("userId") as string,
      });
    }
  }, []);

  useEffect(() => {
    if (!loginInfo) {
      return;
    }

    const _client = sdk.createClient({
      baseUrl: `http://localhost:8088`,
      accessToken: loginInfo.accessToken,
      userId: loginInfo.userId,
    });

    _client.startClient({ initialSyncLimit: 200 }).then(() => {
      console.log("connected");

      _client.on("Room", function () {
        const roomMap = _client.getRooms();
        setRooms(() => [...roomMap]);
      });

      setClient(_client);
    });
  }, [loginInfo?.accessToken]);

  return (
    <div className="container mx-auto">
      <div className="max-w-2xl border rounded">
        <div className="w-full">
          <div className="container mx-auto">
            <div className="max-w-2xl border rounded">
              <div className="relative flex items-center p-3 border-b border-gray-300">
                <Profile client={client} loginInfo={loginInfo} />

                {!!loginInfo && (
                  <CreateRoom
                    onCreateRoom={async (name) => {
                      await sendRequest("http://localhost:8088", {
                        url: "_matrix/client/r0/createRoom",
                        method: "post",
                        query: {
                          access_token: loginInfo.accessToken,
                        },
                        data: {
                          name,
                        },
                      });
                    }}
                  />
                )}
              </div>

              <div className="relative flex items-center p-3 border-b border-gray-300">
                <button onClick={() => setIsLogin(!isLogin)}>Login</button>
                {"|"}
                <button onClick={() => setIsRegistering(!isRegistering)}>
                  Register
                </button>
                {"|"}
                <button onClick={() => setShowRoomList(!showRoomList)}>
                  Show room list
                </button>
              </div>

              <div className="w-full">
                <Register
                  isOpen={isRegistering}
                  onSubmit={async (params) => {
                    try {
                      await sendRequest("http://localhost:8088", {
                        url: "_matrix/client/r0/register",
                        method: "post",
                        data: {
                          username: params.username,
                          password: params.password,
                          auth: {
                            type: "m.login.dummy",
                          },
                        },
                      });

                      toastRef.current?.show({
                        intent: "success",
                        message: "Successfully",
                      });

                      setIsRegistering(false);
                    } catch (error) {
                      console.log("error", error);

                      toastRef.current?.show({
                        intent: "error",
                        message: "Failed",
                      });
                    }
                  }}
                  onClose={() => {
                    setIsRegistering(false);
                  }}
                />

                <Login
                  isOpen={isLogin}
                  onSubmit={async (params) => {
                    try {
                      const result = await sendRequest<{
                        url: "_matrix/client/r0/login";
                        method: "post";
                        data: {
                          user: string;
                          password: string;
                          type: "m.login.password";
                        };
                        result: {
                          user_id: string;
                          access_token: string;
                          device_id: string;
                          home_server: string;
                        };
                      }>("http://localhost:8088", {
                        url: "_matrix/client/r0/login",
                        method: "post",
                        data: {
                          user: params.username,
                          password: params.password,
                          type: "m.login.password",
                        },
                      });

                      toastRef.current?.show({
                        intent: "success",
                        message: "Successfully",
                      });

                      setLoginInfo({
                        accessToken: result.access_token,
                        userId: result.user_id,
                      });

                      localStorage.setItem("accessToken", result.access_token);
                      localStorage.setItem("userId", result.user_id);

                      setIsLogin(false);
                    } catch (error) {
                      console.log("error", error);

                      toastRef.current?.show({
                        intent: "error",
                        message: "Failed",
                      });
                    }
                  }}
                  onClose={() => {
                    setIsLogin(false);
                  }}
                />

                {showRoomList && (
                  <RoomList
                    rooms={rooms}
                    onSelectRoom={(room) => {
                      setSelectedRoom(room);
                      setShowRoomList(false);
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {!!client && !!selectedRoom && (
            <>
              <Messages room={selectedRoom} client={client} />

              <ChatInput
                onSendMessage={async (text) => {
                  await client.sendEvent(
                    selectedRoom.roomId,
                    "m.room.message",
                    {
                      body: text,
                      msgtype: "m.text",
                    }
                  );
                }}
              />
            </>
          )}
        </div>
      </div>

      <Toast ref={toastRef} />
    </div>
  );
}
