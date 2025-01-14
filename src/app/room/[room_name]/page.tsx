"use client";

import { WebAudioContext } from "@/providers/audio/webAudio";
import { BottomBar } from "@/components/BottomBar";
import { RoomInfo } from "@/components/RoomInfo";
import { UsernameInput } from "@/components/UsernameInput";
import {
  ConnectionDetails,
  ConnectionDetailsBody,
} from "@/pages/api/connection_details";
import { LiveKitRoom } from "@livekit/components-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  CharacterName,
  CharacterSelector,
} from "@/components/CharacterSelector";
import { useMobile } from "@/util/useMobile";
import { GameView } from "@/components/GameView";

type Props = {
  params: { room_name: string };
};

export default function Page({ params: { room_name } }: Props) {
  const [connectionDetails, setConnectionDetails] =
    useState<ConnectionDetails | null>(null);
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterName>("doux");
  const isMobile = useMobile();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    setAudioContext(new AudioContext());
    return () => {
      setAudioContext((prev) => {
        prev?.close();
        return null;
      });
    };
  }, []);

  const humanRoomName = useMemo(() => {
    return decodeURI(room_name);
  }, [room_name]);

  const requestConnectionDetails = useCallback(
    async (username: string) => {
      const body: ConnectionDetailsBody = {
        room_name,
        username,
        character: selectedCharacter,
      };
      const response = await fetch("/api/connection_details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.status === 200) {
        return response.json();
      }

      const { error } = await response.json();
      throw error;
    },
    [room_name, selectedCharacter]
  );

  if (!audioContext) {
    return null;
  }

  // If we don't have any connection details yet, show the username form
  if (connectionDetails === null) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <Toaster />
        <h2 className="text-4xl mb-4">{humanRoomName}</h2>
        <RoomInfo roomName={room_name} />
        <div className="divider"></div>
        <UsernameInput
          submitText="Join Room"
          onSubmit={async (username) => {
            try {
              // TODO unify this kind of pattern across examples, either with the `useToken` hook or an equivalent
              const connectionDetails = await requestConnectionDetails(
                username
              );
              setConnectionDetails(connectionDetails);
            } catch (e: any) {
              toast.error(e);
            }
          }}
        />
      </div>
    );
  }

  // Show the room UI
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="p-6 bg-gray-100 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-2">Welcome to the Syntexity Audio Room</h2>
        <p className="text-gray-700">This is the description of the game room. You can write any relevant information here.</p>
      </div>
      <LiveKitRoom
        token={connectionDetails.token}
        serverUrl={connectionDetails.ws_url}
        connect={true}
        connectOptions={{ autoSubscribe: false }}
        options={{ expWebAudioMix: { audioContext } }}
        style={{ flexGrow: 1 }}
      >
        <WebAudioContext.Provider value={audioContext}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="grow flex">
              <div className="grow">
                <GameView />
              </div>
            </div>
            <div className="flex justify-center items-center h-20 bg-gray-100 rounded-t-lg shadow-md">
              <BottomBar />
            </div>
          </div>
        </WebAudioContext.Provider>
      </LiveKitRoom>
    </div>
  );
}