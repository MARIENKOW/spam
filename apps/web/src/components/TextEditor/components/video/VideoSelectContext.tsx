import { createContext, useContext } from "react";
import { VideoDto } from "@myorg/shared/dto";

interface VideoSelectContextValue {
    onSelect?: (video: VideoDto) => void;
}

export const VideoSelectContext = createContext<VideoSelectContextValue>({});

export const useVideoSelect = () => useContext(VideoSelectContext);
