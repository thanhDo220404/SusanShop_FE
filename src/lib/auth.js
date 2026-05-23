const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2204";

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.mess || "Request failed");
  return data;
}

export const authApi = {
  login: async (email, pass) => {
    const data = await request("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, pass }),
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.Token);
      localStorage.setItem("user", JSON.stringify(data.User));
    }
    return { user: data.User, token: data.Token };
  },

  register: async (name, email, pass, phone) => {
    await request("/users/register", {
      method: "POST",
      body: JSON.stringify({ name, email, pass, phone }),
    });
    return authApi.login(email, pass);
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getToken: () => {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
  },

  getUser: () => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user");
      if (raw) {
        try { return JSON.parse(raw); } catch { return null; }
      }
    }
    return null;
  },
};
