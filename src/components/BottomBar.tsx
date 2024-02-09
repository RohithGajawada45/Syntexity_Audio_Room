import { useMobile } from "@/util/useMobile";
import { MicrophoneMuteButton } from "./MicrophoneMuteButton";
import { MicrophoneSelector } from "./MicrophoneSelector";
import { PoweredByLiveKit } from "./PoweredByLiveKit";

export function BottomBar() {
  const mobile = useMobile();
  return (
    <div className="flex justify-center items-center w-full h-full bg-gray-100 rounded-t-lg shadow-md">
      <div className="flex">
        <MicrophoneMuteButton />
        <div className="ml-4">
          <MicrophoneSelector />
        </div>
      </div>
    </div>
  );
}
