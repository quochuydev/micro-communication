import React, { useEffect, useState } from "react";
import * as sdk from "matrix-js-sdk";
import { LoginInfo } from "../ChatBox/ChatBox";

export default function Profile({
  client,
  loginInfo,
}: {
  client?: sdk.MatrixClient;
  loginInfo?: LoginInfo;
}) {
  if (!client || !loginInfo) return null;

  const [userInfo, setUserInfo] = useState<{
    avatar_url?: string | undefined;
    displayname?: string | undefined;
  }>();

  useEffect(() => {
    client.getProfileInfo(loginInfo.userId).then((info) => {
      setUserInfo(info);
    });
  }, [loginInfo.userId]);

  return (
    <>
      <img
        className="object-cover w-10 h-10 rounded-full"
        src={
          userInfo?.avatar_url ||
          "https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383__340.jpg"
        }
        alt={userInfo?.displayname}
      />

      <span className="block ml-2 font-bold text-gray-600">
        {userInfo?.displayname || "No name ^^"}
      </span>

      <span className="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3"></span>
    </>
  );
}
