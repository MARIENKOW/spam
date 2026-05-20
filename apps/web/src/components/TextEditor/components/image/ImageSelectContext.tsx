import { createContext, useContext } from "react";
import { ImageDto } from "@myorg/shared/dto";

interface ImageSelectContextValue {
    onSelect?: (image: ImageDto) => void;
}

export const ImageSelectContext = createContext<ImageSelectContextValue>({});

export const useImageSelect = () => useContext(ImageSelectContext);
