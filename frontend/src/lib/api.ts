const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
    }
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  }

  clearAccessToken() {
    this.accessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");

    if (this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "API request failed");
    }
    return response.json();
  }

  async loginWithGoogle(idToken: string) {
    return this.request<{ accessToken: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  }

  async logout() {
    return this.request<{ success: boolean }>("/auth/logout", {
      method: "POST",
    });
  }

  async getMe() {
    return this.request<{
      id: string;
      email: string;
      name?: string | null;
      homeNodeId?: string | null;
    }>("/user/me");
  }

  async setHomeNode(nodeId: string) {
    return this.request<{
      id: string;
      homeNodeId?: string | null;
    }>("/user/homeNode", {
      method: "PATCH",
      body: JSON.stringify({ nodeId }),
    });
  }

  async getNodes(bbox?: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  }) {
    const params = new URLSearchParams();
    if (bbox) {
      params.append("minLat", bbox.minLat.toString());
      params.append("minLng", bbox.minLng.toString());
      params.append("maxLat", bbox.maxLat.toString());
      params.append("maxLng", bbox.maxLng.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<any[]>(`/nodes${query}`);
  }

  async createNode(data: {
    name: string;
    latitude: number;
    longitude: number;
  }) {
    return this.request<any>("/nodes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteNode(id: string) {
    return this.request<any>(`/nodes/${id}`, {
      method: "DELETE",
    });
  }

  async getEdges() {
    return this.request<any[]>("/edges");
  }

  async createEdge(fromId: string, toId: string, traveledAt?: string) {
    {
      return this.request<any>("/edges", {
        method: "POST",
        body: JSON.stringify({ fromId, toId, traveledAt }),
      });
    }
  }

  async deleteEdge(id: string) {
    return this.request<any>(`/edges/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
