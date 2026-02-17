export interface User {
  id: string;
  name?: string | null;
  email: string;
}

export interface Node {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface Edge {
  id: string;
  fromId: string;
  toId: string;
  traveledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}


export interface AuthResponse {
  accessToken: string;
  user: User;
}