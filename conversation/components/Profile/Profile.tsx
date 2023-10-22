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

  const [profile, setProfile] = useState<{
    avatar_url?: string | undefined;
    displayname?: string | undefined;
  }>();

  useEffect(() => {
    client.getProfileInfo(loginInfo.userId).then((info) => {
      setProfile(info);
    });
  }, [loginInfo.userId]);

  const defaultAvatar =
    "https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383__340.jpg";

  return (
    <div className="relative p-3 border-b border-gray-300">
      <div className="flex items-center">
        <img
          className="object-cover w-10 h-10 rounded-full"
          src={profile?.avatar_url || defaultAvatar}
          alt={profile?.displayname}
        />

        <div className="ml-2">
          <p className="font-bold text-gray-600">{profile?.displayname}</p>
          <p className="text-sm">{loginInfo?.userId}</p>
          <p className="text-sm">device: {loginInfo.deviceId}</p>
        </div>

        <span className="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3"></span>
      </div>
    </div>
  );
}
