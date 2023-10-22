import React, { useEffect, useReducer, useRef, useState } from "react";
import * as sdk from "matrix-js-sdk";
import { sendRequest } from "../../helpers/api-caller";
import Toast, { ToastType } from "../Toast/Toast";
import RoomList from "../RoomList/RoomList";
import ChatInput from "../ChatInput/ChatInput";
import Register from "../Register/Register";
import Login from "../Login/Login";
import NewRoom from "../NewRoom/NewRoom";
import Profile from "../Profile/Profile";
import Messages from "../Messages/Messages";
import Passphrase from "../Passphrase/Passphrase";
import {} from "matrix-js-sdk/lib/crypto";

export type LoginInfo = {
  accessToken: string;
  userId: string;
  deviceId: string;
};

const matrixUrl = `http://localhost:8088`;

export default function ChatBox({ index = 0 }: { index: number }) {
  const setStorage = (params: {
    accessToken: string;
    userId: string;
    deviceId: string;
  }) => {
    localStorage.setItem(`accessToken.${index}`, params.accessToken);
    localStorage.setItem(`userId.${index}`, params.userId);
    localStorage.setItem(`deviceId.${index}`, params.deviceId);
  };

  const getStorage = () => {
    const storage = {
      accessToken: localStorage.getItem(`accessToken.${index}`) as string,
      userId: localStorage.getItem(`userId.${index}`) as string,
      deviceId: localStorage.getItem(`deviceId.${index}`) as string,
    };

    return storage;
  };

  const [client, setClient] = useState<sdk.MatrixClient>();
  const [rooms, setRooms] = useState<sdk.Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<sdk.Room>();
  const [loginInfo, setLoginInfo] = useState<LoginInfo>();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [showRoomList, setShowRoomList] = useState(true);
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
  const [showInputPassphrase, setShowInputPassphrase] = useState(false);

  const toastRef = useRef<ToastType>();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (global.Olm) {
      global.Olm.init();
    }
  }, [global.Olm]);

  useEffect(() => {
    const storage = getStorage();

    if (storage.accessToken && storage.userId && storage.deviceId) {
      setLoginInfo({
        accessToken: storage.accessToken,
        userId: storage.userId,
        deviceId: storage.deviceId,
      });
    }
  }, []);

  useEffect(() => {
    if (!loginInfo) {
      return;
    }

    const _client = sdk.createClient({
      baseUrl: matrixUrl,
      accessToken: loginInfo.accessToken,
      userId: loginInfo.userId,
      deviceId: loginInfo.deviceId,
      cryptoStore: new sdk.MemoryCryptoStore(),
    });

    _client.initCrypto().then(() => {
      console.log("initial crypto");

      _client.startClient({ initialSyncLimit: 200 }).then(async () => {
        console.log("connected");

        // const olmAccount = new global.Olm.Account();
        // await olmAccount.generate_one_time_keys(10);
        // const one_time_keys = await olmAccount.one_time_keys();

        // const keys = JSON.parse(one_time_keys);
        // console.log("keys", keys);

        // const result: {
        //   [signedCurve25519Key: string]: {
        //     key: string;
        //     fallback?: boolean;
        //     signatures: {
        //       [userId: string]: {
        //         [deviceEd25519Key: string]: string;
        //       };
        //     };
        //   };
        // } = {};

        // for (const [keyName, value] of Object.entries(keys.curve25519)) {
        //   const keyObj = { key: value };
        //   const signedKey = await olmAccount.sign(JSON.stringify(keyObj));

        //   result[`signed_curve25519:${keyName}`] = {
        //     ...keyObj,
        //     signatures: {
        //       [loginInfo.userId]: {
        //         [`ed25519:${loginInfo.deviceId}`]: signedKey,
        //       },
        //     },
        //   };
        // }

        // _client.uploadKeysRequest({
        //   one_time_keys: result,
        // });

        _client.on(sdk.CryptoEvent.RoomKeyRequest, function (event) {
          console.log("requested key");
          event.share();
        });

        _client.on(sdk.ClientEvent.Room, function () {
          const roomMap = _client.getRooms();
          setRooms(() => [...roomMap]);
        });

        _client.on(
          sdk.RoomEvent.Timeline,
          async function (event: sdk.MatrixEvent) {
            if (
              [
                sdk.EventType.RoomMessage,
                sdk.EventType.RoomMessageEncrypted,
              ].includes(event.event.type as sdk.EventType)
            ) {
              if (event.event.type === sdk.EventType.RoomMessageEncrypted) {
                // console.log("decrypt before:", event.event.type);
                // await _client.decryptEventIfNeeded(event);
                // console.log("decrypt after:", event.event.type);
              }

              forceUpdate();
            }
          }
        );

        setClient(_client);
      });
    });
  }, [loginInfo?.accessToken]);

  useEffect(() => {
    if (!client) {
      return;
    }

    if (!selectedRoom) {
      return;
    }

    const setEncRoom = async () => {
      try {
        await client.setRoomEncryption(selectedRoom.roomId, {
          algorithm: "m.megolm.v1.aes-sha2",
        });

        // console.log("set enc room success");
      } catch (error) {
        console.log(`setEncRoom:`, error);
      }
    };

    const sendRoomKeys = async () => {
      try {
        const targetMembers = await selectedRoom.getEncryptionTargetMembers();
        const userIds = targetMembers.map((member) => member.userId);
        const devices = await client.downloadKeys(userIds, false);
        // console.log("devices", devices);

        for (const [userId, device] of devices as any) {
          for (const devId of device.keys()) {
            // console.log("userId", userId, "devId", devId);

            try {
              await client.setDeviceVerified(userId, devId, true);
              // console.log("verify device success");
            } catch (error) {
              console.log(`devVerifyErr:`, error);
            }
          }
        }
      } catch (error) {
        console.log("debug", error);
      }
    };

    // setEncRoom();
    // sendRoomKeys();
  }, [selectedRoom]);

  const messageListRef = useRef<HTMLDivElement>();

  const scrollToMessageListBottom = () => {
    messageListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto">
      <div className="max-w-2xl border rounded">
        <div className="w-full">
          <div className="container mx-auto">
            <div className="max-w-2xl border rounded">
              <Profile client={client} loginInfo={loginInfo} />

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
                {"|"}
                <button
                  onClick={() => setShowCreateRoomForm(!showCreateRoomForm)}
                >
                  New room
                </button>
                {"|"}
                <button
                  onClick={() => setShowInputPassphrase(!showInputPassphrase)}
                >
                  Input passphrase
                </button>
              </div>

              {!!selectedRoom && (
                <div className="p-3 text-sm">
                  <div>roomId: {selectedRoom.roomId}</div>
                  <div>room: {selectedRoom.name}</div>
                </div>
              )}

              <div className="w-full">
                <Register
                  isOpen={isRegistering}
                  onSubmit={async (params) => {
                    try {
                      await sendRequest(matrixUrl, {
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
                      }>(matrixUrl, {
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
                        deviceId: result.device_id,
                      });

                      setStorage({
                        accessToken: result.access_token,
                        userId: result.user_id,
                        deviceId: result.device_id,
                      });

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

                {!!client && showInputPassphrase && (
                  <Passphrase
                    onSubmit={async (passphrase) => {
                      console.log("passphrase", passphrase);
                      const backup = await client.checkKeyBackup();
                      console.log("backup", backup);

                      const createSecureBackup = async () => {
                        try {
                          const prepare = await client.prepareKeyBackupVersion(
                            passphrase
                          );

                          const keyBackup = await client.createKeyBackupVersion(
                            prepare
                          );

                          console.log("keyBackup", keyBackup);
                          return keyBackup;
                        } catch (error) {
                          console.log("error", error);
                        }
                      };

                      const restoreBackup = async (
                        backup: any,
                        passphrase: string
                      ) => {
                        try {
                          if (
                            backup.backupInfo.auth_data?.private_key_salt &&
                            backup.backupInfo.auth_data?.private_key_iterations
                          ) {
                            const backupWithPassword =
                              await client.restoreKeyBackupWithPassword(
                                passphrase,
                                undefined,
                                undefined,
                                backup.backupInfo,
                                {}
                              );

                            console.log(
                              "backupWithPassword",
                              backupWithPassword
                            );

                            return backupWithPassword;
                          } else {
                            await client.enableKeyBackup(backup.backupInfo);

                            if (!backup.trustInfo.usable) {
                              const recoverInfo =
                                await client.restoreKeyBackupWithSecretStorage(
                                  backup.backupInfo,
                                  undefined,
                                  undefined
                                );

                              console.log("recoverInfo", recoverInfo);

                              return recoverInfo;
                            }
                          }
                        } catch (error) {
                          console.log("error", error);
                        }
                      };

                      if (backup?.backupInfo) {
                        const result1 = await restoreBackup(backup, passphrase);
                        console.log("result1", result1);
                      } else {
                        const result2 = await createSecureBackup();
                        console.log("result2", result2);
                      }
                    }}
                    onClose={() => setShowInputPassphrase(false)}
                  />
                )}

                {showRoomList && !!loginInfo && !!client && (
                  <RoomList
                    loginInfo={loginInfo}
                    rooms={rooms}
                    onSelectRoom={async (room) => {
                      const member = room.getMember(loginInfo.userId);

                      if (member?.membership === "invite") {
                        await client.joinRoom(room.roomId);
                      }

                      setSelectedRoom(room);
                      setShowRoomList(false);
                    }}
                  />
                )}

                {showCreateRoomForm && !!client && !!loginInfo && (
                  <NewRoom
                    onNewRoom={async ({ roomName, usersInvited }) => {
                      const room = await sendRequest<{
                        url: "_matrix/client/r0/createRoom";
                        method: "post";
                        query: {
                          access_token: string;
                        };
                        data: {
                          name: string;
                        };
                        result: {
                          room_id: string;
                        };
                      }>(matrixUrl, {
                        url: "_matrix/client/r0/createRoom",
                        method: "post",
                        query: {
                          access_token: loginInfo.accessToken,
                        },
                        data: {
                          name: roomName,
                        },
                      });

                      if (usersInvited) {
                        await sendRequest<{
                          url: "/_matrix/client/v3/rooms/{roomId}/invite";
                          method: "post";
                          params: {
                            roomId: string;
                          };
                          query: {
                            access_token: string;
                          };
                          data: {
                            reason: string;
                            user_id: string;
                          };
                          result: void;
                        }>(matrixUrl, {
                          url: "/_matrix/client/v3/rooms/{roomId}/invite",
                          method: "post",
                          params: {
                            roomId: room.room_id,
                          },
                          query: {
                            access_token: loginInfo.accessToken,
                          },
                          data: {
                            reason: "Welcome to the team!",
                            user_id: usersInvited.startsWith("@")
                              ? usersInvited
                              : `@${usersInvited}:homeserver.localhost`,
                          },
                        });

                        // await client.sendSharedHistoryKeys(room.room_id, [
                        //   usersInvited,
                        // ]);

                        // console.log("shared keys");
                      }

                      setShowCreateRoomForm(false);
                    }}
                    onClose={() => setShowCreateRoomForm(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {!!client && !!selectedRoom && !!loginInfo && (
            <div>
              <Messages
                loginInfo={loginInfo}
                room={selectedRoom}
                messageListRef={messageListRef}
              />

              <ChatInput
                defaultText={"hello"}
                onSendMessage={async (text) => {
                  await client.sendTextMessage(
                    selectedRoom.roomId,
                    `${text} - now: ${new Date().toISOString()}`
                  );

                  scrollToMessageListBottom();
                }}
              />
            </div>
          )}
        </div>
      </div>

      <Toast ref={toastRef} />
    </div>
  );
}
