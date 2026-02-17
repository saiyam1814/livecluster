"use client";

interface PodCounterProps {
  current: number;
  threshold: number;
}

export default function PodCounter({ current, threshold }: PodCounterProps) {
  const pct = Math.min((current / threshold) * 100, 100);

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-lg px-4 py-3 min-w-[200px]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400 font-mono">PODS DEPLOYED</span>
          <span className="text-sm font-bold text-k8s-blue">{current}/{threshold}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-k8s-blue rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
