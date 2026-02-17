"use client";

interface DeploymentBannerProps {
  count: number;
}

export default function DeploymentBanner({ count }: DeploymentBannerProps) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex justify-center pt-8 pointer-events-none"
      style={{ animation: "banner-slide 0.8s ease-out" }}
    >
      <div className="bg-green-900/90 backdrop-blur-lg border border-green-400/50 rounded-2xl px-10 py-6 text-center shadow-2xl shadow-green-500/20">
        <div className="text-green-400 text-sm font-mono mb-1 tracking-wider">
          ✓ DEPLOYMENT SUCCESSFUL
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          🎉 Cluster Complete! 🎉
        </h1>
        <p className="text-green-300 text-lg">
          {count} pods deployed successfully to the KCD cluster
        </p>
        <div className="mt-3 text-green-500/60 text-xs font-mono">
          kubectl get pods -n kcd | wc -l → {count}
        </div>
      </div>
    </div>
  );
}
