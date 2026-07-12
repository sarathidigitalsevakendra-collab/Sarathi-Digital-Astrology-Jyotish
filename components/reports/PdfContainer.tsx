"use client";

import React from "react";

interface PdfContainerProps {
  id: string; // Unique ID for html2canvas to target
  children: React.ReactNode;
}

/**
 * A hidden container used for rendering PDF content off-screen.
 * It enforces A4 width (210mm) to ensure consistent rendering.
 */
export default function PdfContainer({ id, children }: PdfContainerProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
        width: "210mm", // A4 Width
        minHeight: "297mm", // A4 Height
        backgroundColor: "white",
        color: "black",
        zIndex: -1,
      }}
    >
      <div id={id} className="pdf-root">
        {children}
      </div>
    </div>
  );
}
