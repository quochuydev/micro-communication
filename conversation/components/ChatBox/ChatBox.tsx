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

export default function ChatBox() {
  const olm = global.Olm;
  const [client, setClient] = useState<sdk.MatrixClient>();
  const [token, setToken] = useState();
  const [rooms, setRooms] = useState<sdk.Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<sdk.Room>();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const toastRef = useRef<ToastType>();

  useEffect(() => {
    if (olm) {
      olm.init();
    }
  }, [olm]);

  useEffect(() => {
    let _client = sdk.createClient({
      baseUrl: `http://localhost:8088/_matrix`,
    });

    // console.log("_client", _client);

    setClient(_client);
  }, []);

  useEffect(() => {
    if (token) {
      console.log("token", token);
    }
  }, [token]);

  return (
    <div className="container mx-auto">
      <div className="max-w-2xl border rounded">
        <RoomList rooms={rooms} />

        <div>
          <div className="w-full">
            <div className="container mx-auto">
              <div className="max-w-2xl border rounded">
                <div className="relative flex items-center p-3 border-b border-gray-300">
                  <Profile />
                  <CreateRoom />
                </div>

                <div className="relative flex items-center p-3 border-b border-gray-300">
                  <button onClick={() => setIsLogin(!isLogin)}>Login</button>
                  {"|"}
                  <button onClick={() => setIsRegistering(!isRegistering)}>
                    Register
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
                        const result = await sendRequest(
                          "http://localhost:8088",
                          {
                            url: "_matrix/client/r0/login",
                            method: "post",
                            data: {
                              user: params.username,
                              password: params.password,
                              type: "m.login.password",
                            },
                          }
                        );

                        toastRef.current?.show({
                          intent: "success",
                          message: "Successfully",
                        });

                        setToken(result.access_token);
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
                </div>
              </div>
            </div>

            <Messages />
            <ChatInput
              onSendMessage={(text) => {
                console.log("text", text);
              }}
            />
          </div>
        </div>
      </div>

      <Toast ref={toastRef} />
    </div>
  );
}
