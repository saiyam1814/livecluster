"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRDisplayProps {
  url: string;
  mini?: boolean;
}

export default function QRDisplay({ url, mini = false }: QRDisplayProps) {
  if (mini) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white p-2 rounded-lg shadow-lg shadow-black/50">
        <QRCodeSVG value={url} size={100} bgColor="#ffffff" fgColor="#0a0e27" />
        <p className="text-[9px] text-center text-gray-800 mt-1 font-medium">Scan to join</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-space-dark">
      <h1 className="text-5xl font-bold text-k8s-blue mb-2">LiveCluster</h1>
      <p className="text-gray-400 text-xl mb-8">Scan to join the Kubernetes cluster</p>

      <div className="bg-white p-6 rounded-2xl shadow-2xl shadow-k8s-blue/20" style={{ animation: "pulse-glow 3s ease-in-out infinite" }}>
        <QRCodeSVG value={url} size={280} bgColor="#ffffff" fgColor="#0a0e27" />
      </div>

      <p className="text-gray-500 text-sm mt-6 font-mono">{url}</p>

      <div className="mt-8 flex items-center gap-2 text-gray-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm">Waiting for pods...</span>
      </div>
    </div>
  );
}
