import { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
let socket: any;

const currentUserId = Math.ceil(Math.random() * 10000);

const backend = `http://localhost:4444`;

export default function VideoCall(props: any) {
  const [local, setLocal] = useState(undefined);
  const [remote, setRemote] = useState(undefined);

  const peerConnection = useRef<RTCPeerConnection>();

  useEffect(() => {
    const { RTCPeerConnection } = window;
    const _peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.current = _peerConnection;
  }, []);

  useEffect(() => {
    socket = io(backend);

    socket.on("offered", async ({ offer, userId }: any) => {
      console.log({ userId, currentUserId });

      if (userId === currentUserId) {
        return;
      }

      console.log("offer");

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnection.current.createAnswer();

      await peerConnection.current.setLocalDescription(
        new RTCSessionDescription(answer)
      );

      axios
        .post(backend + "/answer", { answer, userId })
        .then(console.log)
        .catch(console.log);
    });

    socket.on("answer", async ({ answer, userId }: any) => {
      console.log({ userId, currentUserId });

      if (userId !== currentUserId) {
        return;
      }

      console.log("answer");

      try {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        //
      }
    });

    return () => {
      socket?.off();
    };
  }, [peerConnection]);

  useEffect(() => {
    navigator.getUserMedia(
      { video: true, audio: false },
      (stream: MediaSource) => {
        console.log("stream", stream);

        const video: any = document.getElementById("local-video");

        if (video) {
          setLocal(stream.id);
          video.srcObject = stream;
        }

        stream
          .getTracks()
          .forEach((track: any) =>
            peerConnection.current.addTrack(track, stream)
          );
      },
      (error: any) => {
        console.warn(error.message);
      }
    );

    peerConnection.current.ontrack = function ({ streams: [stream] }: any) {
      console.log("ontrack", stream);

      const video: any = document.getElementById("remote-video");

      if (video) {
        setRemote(stream.id);

        video.srcObject = stream;
      }
    };
  }, [peerConnection]);

  async function createOffer() {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(
      new RTCSessionDescription(offer)
    );
    return offer;
  }

  return (
    <div>
      <button
        onClick={async () => {
          const offer = await createOffer();

          axios
            .post(backend + "/offer", {
              offer,
              userId: currentUserId,
            })
            .then(console.log)
            .catch(console.log);
        }}
      >
        call
      </button>

      <p>{remote}</p>
      <video autoPlay muted id="remote-video"></video>

      <p>{local}</p>
      <video autoPlay muted id="local-video"></video>
    </div>
  );
}
