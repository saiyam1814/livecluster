"use client";

import { useEffect, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import type { AppState, User } from "@/lib/types";
import QRDisplay from "@/components/QRDisplay";
import KubernetesViz from "@/components/KubernetesViz";
import PodCounter from "@/components/PodCounter";
import Fireworks from "@/components/Fireworks";
import DeploymentBanner from "@/components/DeploymentBanner";

type Phase = "qr" | "viz" | "celebration";

export default function DisplayPage() {
  const [state, setState] = useState<AppState>({ users: [], threshold: 10, isDeployed: false });
  const [phase, setPhase] = useState<Phase>("qr");
  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    // Build join URL from the browser's location
    const origin = window.location.origin;
    setJoinUrl(`${origin}/join`);
  }, []);

  const handleStateSync = useCallback((newState: AppState) => {
    setState(newState);
    if (newState.isDeployed) {
      setPhase("celebration");
    } else if (newState.users.length > 0) {
      setPhase("viz");
    }
  }, []);

  const handleUserJoined = useCallback((_user: User) => {
    // Phase transition handled via state-sync
  }, []);

  const handleDeployment = useCallback(() => {
    setPhase("celebration");
  }, []);

  const handleReset = useCallback(() => {
    setState({ users: [], threshold: state.threshold, isDeployed: false });
    setPhase("qr");
  }, [state.threshold]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("state-sync", handleStateSync);
    socket.on("user-joined", handleUserJoined);
    socket.on("deployment-complete", handleDeployment);
    socket.on("reset", handleReset);

    return () => {
      socket.off("state-sync", handleStateSync);
      socket.off("user-joined", handleUserJoined);
      socket.off("deployment-complete", handleDeployment);
      socket.off("reset", handleReset);
    };
  }, [handleStateSync, handleUserJoined, handleDeployment, handleReset]);

  if (!joinUrl) return null;

  if (phase === "qr") {
    return <QRDisplay url={joinUrl} />;
  }

  return (
    <div className="w-screen h-screen bg-space-dark overflow-hidden relative">
      <KubernetesViz users={state.users} celebrating={phase === "celebration"} />
      <PodCounter current={state.users.length} threshold={state.threshold} />
      <QRDisplay url={joinUrl} mini />

      {phase === "celebration" && (
        <>
          <Fireworks />
          <DeploymentBanner count={state.users.length} users={state.users} />
        </>
      )}
    </div>
  );
}
