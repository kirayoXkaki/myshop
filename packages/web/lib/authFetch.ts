import { API_BASE } from "@/lib/api";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./tokens";

/**
 * 受保护的 fetch：
 * - 自动带 Authorization
 * - 401 时尝试 refresh（仅一次），成功则重试原请求
 * - 刷新失败则清理并跳登录
 */
export async function authFetch(input: string | URL, init: RequestInit = {}) {
  async function withAccessToken(): Promise<Response> {
    const token = getAccessToken();
    const headers = new Headers(init.headers || {});
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers, cache: "no-store" });
  }

  // 第一次尝试
  let res = await withAccessToken();
  if (res.status !== 401) return res;

  // 尝试刷新
  const refresh = getRefreshToken();
  if (!refresh) {
    logoutAndRedirect();
    throw new Error("Unauthorized");
  }

  const rf = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (!rf.ok) {
    logoutAndRedirect();
    throw new Error("Refresh failed");
  }

  const data = await rf.json(); // { access_token, refresh_token, user }
  if (data?.access_token && data?.refresh_token) {
    saveTokens(data.access_token, data.refresh_token);
  } else {
    logoutAndRedirect();
    throw new Error("Refresh response invalid");
  }

  // 刷新成功 → 重试原请求一次
  res = await withAccessToken();
  if (res.status === 401) {
    logoutAndRedirect();
    throw new Error("Unauthorized after refresh");
  }
  return res;
}

function logoutAndRedirect() {
  clearTokens();
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
}
