"use client";

import { useState } from "react";
import { getSocket } from "@/lib/socket";

const BAD_WORDS = [
  "fuck", "fucker", "fucking", "fuk", "f*ck",
  "shit", "shithead", "bullshit",
  "bitch", "bastard", "cunt",
  "nigger", "nigga",
  "faggot", "fag",
  "whore", "slut",
  "cock", "dick", "pussy", "ass", "asshole", "arse",
  "motherfucker", "jackass", "dumbass",
  "rape", "porn", "nazi",
];

function containsProfanity(text: string): boolean {
  const cleaned = text.toLowerCase().replace(/[^a-z]/g, "");
  return BAD_WORDS.some((word) => cleaned.includes(word.replace(/[^a-z]/g, "")));
}

export default function JoinPage() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = () => {
    const trimmed = name.trim();
    if (!trimmed || submitting) return;

    if (containsProfanity(trimmed)) {
      setError("Please use an appropriate name. Foul language is not allowed.");
      return;
    }

    setError("");
    setSubmitting(true);
    const socket = getSocket();

    socket.emit("join", { name: trimmed }, (response) => {
      setSubmitting(false);
      if (response.success) {
        setJoined(true);
      } else {
        setError("Name not allowed. Please choose a different name.");
      }
    });
  };

  if (joined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-space-dark p-6">
        <div className="text-center" style={{ animation: "float-in 0.5s ease-out" }}>
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-k8s-blue mb-2">Pod Deployed!</h1>
          <p className="text-gray-400 text-lg">
            <span className="text-white font-semibold">{name}</span> is now running in the cluster
          </p>
          <div className="mt-6 px-4 py-2 bg-green-900/30 border border-green-500/40 rounded-lg text-green-400 text-sm">
            STATUS: Running ✓
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-space-dark p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-k8s-blue mb-1">LiveCluster</h1>
          <p className="text-gray-400">Join the Kubernetes cluster</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Your Name / Handle</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="e.g. kubectl-master"
              maxLength={30}
              autoFocus
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-k8s-blue focus:ring-1 focus:ring-k8s-blue transition-colors"
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

          <button
            onClick={handleJoin}
            disabled={!name.trim() || submitting}
            className="w-full py-3 bg-k8s-blue hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
          >
            {submitting ? "Deploying..." : "🚀 Deploy Pod"}
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          kubectl apply -f your-pod.yaml
        </p>
      </div>
    </div>
  );
}
