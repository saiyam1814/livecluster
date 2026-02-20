"use client";

import Image from "next/image";
import type { User } from "@/lib/types";

interface DeploymentBannerProps {
  count: number;
  users: User[];
}

export default function DeploymentBanner({ count, users }: DeploymentBannerProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ animation: "banner-slide 0.8s ease-out" }}
    >
      <div className="bg-gray-950/90 backdrop-blur-xl border border-blue-400/40 rounded-3xl px-10 py-8 text-center shadow-2xl shadow-blue-500/20 max-w-4xl w-full mx-8 flex flex-col" style={{ maxHeight: "85vh" }}>
        {/* KCD Delhi 2026 Logo */}
        <div className="flex justify-center mb-3">
          <Image
            src="/kcd-delhi-2026.jpeg"
            alt="KCD Delhi 2026"
            width={130}
            height={130}
            className="rounded-2xl"
          />
        </div>

        {/* Welcome heading */}
        <h1 className="text-4xl font-bold text-white mb-1">
          Welcome to KCD Delhi 2026! 🎉
        </h1>

        <div className="text-green-400 text-sm font-mono mb-1 tracking-wider">
          ✓ DEPLOYMENT SUCCESSFUL
        </div>

        <p className="text-green-300 text-lg mb-4">
          {count} pods deployed successfully to the KCD cluster
        </p>

        {/* Pod names */}
        <div className="overflow-y-auto flex-1">
          <p className="text-gray-400 text-xs font-mono mb-3">
            kubectl get pods -n kcd-delhi-2026
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {users.map((user) => (
              <span
                key={user.id}
                className="px-3 py-1 bg-blue-900/50 border border-blue-400/40 rounded-full text-blue-200 text-sm font-mono"
              >
                {user.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 text-blue-500/60 text-xs font-mono">
          kubectl get pods -n kcd | wc -l → {count}
        </div>
      </div>
    </div>
  );
}
