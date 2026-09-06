"use client";

import { createContext, useContext, type ReactNode } from "react";

const ImageLibraryContext = createContext<() => void>(() => {});

export function ImageLibraryProvider({
  open,
  children,
}: {
  open: () => void;
  children: ReactNode;
}) {
  return (
    <ImageLibraryContext.Provider value={open}>
      {children}
    </ImageLibraryContext.Provider>
  );
}

export function useOpenImageLibrary() {
  return useContext(ImageLibraryContext);
}
