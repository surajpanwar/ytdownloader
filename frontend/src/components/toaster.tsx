"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      theme="dark"
      closeButton
      richColors
      toastOptions={{
        style: {
          background: "#171717",
          border: "1px solid #26262b",
          color: "#ffffff",
        },
      }}
    />
  );
}