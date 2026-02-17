export interface User {
  id: string;
  name: string;
  joinedAt: number;
}

export interface AppState {
  users: User[];
  threshold: number;
  isDeployed: boolean;
}

export interface ServerToClientEvents {
  "state-sync": (state: AppState) => void;
  "user-joined": (user: User) => void;
  "deployment-complete": () => void;
  reset: () => void;
}

export interface ClientToServerEvents {
  join: (data: { name: string }, callback: (response: { success: boolean; user?: User }) => void) => void;
  "set-threshold": (threshold: number) => void;
  reset: () => void;
}
