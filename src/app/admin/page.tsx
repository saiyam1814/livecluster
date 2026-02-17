"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import type { AppState } from "@/lib/types";

export default function AdminPage() {
  const [state, setState] = useState<AppState>({ users: [], threshold: 10, isDeployed: false });
  const [newThreshold, setNewThreshold] = useState("");

  useEffect(() => {
    const socket = getSocket();

    socket.on("state-sync", (s) => {
      setState(s);
      setNewThreshold(String(s.threshold));
    });

    return () => {
      socket.off("state-sync");
    };
  }, []);

  const handleSetThreshold = () => {
    const val = parseInt(newThreshold, 10);
    if (val > 0 && val <= 1000) {
      getSocket().emit("set-threshold", val);
    }
  };

  const handleReset = () => {
    if (confirm("Reset the entire session? This removes all participants.")) {
      getSocket().emit("reset");
    }
  };

  return (
    <div className="min-h-screen bg-space-dark p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-k8s-blue mb-6">Admin Panel</h1>

        {/* Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-mono text-gray-400 mb-3">CLUSTER STATUS</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-white">{state.users.length}</div>
              <div className="text-xs text-gray-500">Pods Running</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{state.threshold}</div>
              <div className="text-xs text-gray-500">Target Threshold</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${state.isDeployed ? "bg-green-500" : "bg-yellow-500"} animate-pulse`} />
            <span className="text-sm text-gray-400">
              {state.isDeployed ? "Deployment Complete" : "Waiting for pods..."}
            </span>
          </div>
        </div>

        {/* Participants */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-mono text-gray-400 mb-3">PARTICIPANTS ({state.users.length})</h2>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {state.users.length === 0 && (
              <p className="text-gray-600 text-sm">No participants yet</p>
            )}
            {state.users.map((u) => (
              <div key={u.id} className="text-sm text-gray-300 font-mono">
                ● {u.name}
              </div>
            ))}
          </div>
        </div>

        {/* Threshold */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-mono text-gray-400 mb-3">DEPLOYMENT THRESHOLD</h2>
          <div className="flex gap-2">
            <input
              type="number"
              value={newThreshold}
              onChange={(e) => setNewThreshold(e.target.value)}
              min={1}
              max={1000}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-k8s-blue"
            />
            <button
              onClick={handleSetThreshold}
              className="px-4 py-2 bg-k8s-blue hover:bg-blue-600 text-white rounded transition-colors"
            >
              Set
            </button>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-full py-3 bg-red-900/50 hover:bg-red-800/50 border border-red-500/30 text-red-400 rounded-lg transition-colors"
        >
          Reset Session
        </button>
      </div>
    </div>
  );
}
