// =======================
// ✅ API CLIENT (Final)
// =======================

// Dynamically resolve the API base URL
function resolveApiBase() {
  // Prefer environment variables (recommended for Vercel)
  const envBase =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL);

  if (envBase) return envBase.replace(/\/+$/, "");

  const host = (typeof window !== "undefined" && window.location?.hostname) || "";

  // Development → local API
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:3000";
  }

  // Production → VPS API domain
  return "https://srv1006127.hstgr.cloud";
}

const BASE = resolveApiBase();

// Generic HTTP helper
async function http(method, path, body, isForm) {
  const started = Date.now();
  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const res = await fetch(url, {
      method,
      headers: isForm ? undefined : { "Content-Type": "application/json" },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });

    const text = await res.text();
    const took = Date.now() - started;

    if (!res.ok) {
      const snippet = text.slice(0, 500);
      console.error(`❌ HTTP ${res.status} ${method} ${url} (${took}ms)`, {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: snippet,
      });
      throw new Error(`HTTP ${res.status}: ${snippet}`);
    }

    console.log(`✓ ${method} ${url} → ${res.status} (${took}ms)`);

    const contentType = res.headers.get("content-type") || "";
    return contentType.includes("application/json")
      ? (text ? JSON.parse(text) : null)
      : text;
  } catch (err) {
    const took = Date.now() - started;
    console.error(`💥 NETWORK ERROR ${method} ${url} (${took}ms):`, err);
    throw err;
  }
}

// =======================
// 📡 API ENDPOINT HELPERS
// =======================

// Basics
export const getBasics = (id) => http("GET", `/api/basics/${id}`);
export const createBasics = (payload) => http("POST", `/api/basics`, payload);
export const updateBasics = (id, payload) =>
  http("PUT", `/api/basics/${id}`, payload);

// Tender
export const getTender = (basicsId) => http("GET", `/api/tenders/${basicsId}`);
export const saveTender = (basicsId, payload) =>
  http("POST", `/api/tenders/${basicsId}`, payload);
export const updateTender = (basicsId, payload) =>
  http("PUT", `/api/tenders/${basicsId}`, payload);
export const uploadTenderFiles = (basicsId, fileList) => {
  const form = new FormData();
  Array.from(fileList || []).forEach((f) => form.append("files", f));
  return http("POST", `/api/tenders/${basicsId}/attachments`, form, true);
};

// Projects
export const getProject = (basicsId) => http("GET", `/api/projects/${basicsId}`);
export const saveProject = (basicsId, payload) =>
  http("POST", `/api/projects/${basicsId}`, payload);
export const updateProject = (basicsId, payload) =>
  http("PUT", `/api/projects/${basicsId}`, payload);
export const uploadProjectFiles = (basicsId, fileList) => {
  const form = new FormData();
  Array.from(fileList || []).forEach((f) => form.append("files", f));
  return http("POST", `/api/projects/${basicsId}/attachments`, form, true);
};

// Combined
export const getCombined = () => http("GET", `/api/combined`);

// Tasks
export const getAllTasks = () => http("GET", "/api/tasks");
export const getTasksByType = (type) => http("GET", `/api/tasks/type/${type}`);
export const getTasksByProject = (projectId) =>
  http("GET", `/api/tasks/project/${projectId}`);
export const getTask = (id) => http("GET", `/api/tasks/${id}`);
export const createTask = (payload) => http("POST", "/api/tasks", payload);
export const updateTask = (id, payload) =>
  http("PUT", `/api/tasks/${id}`, payload);
export const deleteTask = (id) => http("DELETE", `/api/tasks/${id}`);
export const completeTask = (id, payload) =>
  http("PATCH", `/api/tasks/${id}/complete`, payload);

// Extensions
export const getExtensionsByBasicsId = (basicsId) =>
  http("GET", `/api/extensions/basics/${basicsId}`);
export const getExtension = (id) => http("GET", `/api/extensions/${id}`);
export const createExtension = (payload) =>
  http("POST", `/api/extensions`, payload);
export const updateExtension = (id, payload) =>
  http("PUT", `/api/extensions/${id}`, payload);
export const deleteExtension = (id) =>
  http("DELETE", `/api/extensions/${id}`);
export const deleteExtensionsByBasicsId = (basicsId) =>
  http("DELETE", `/api/extensions/basics/${basicsId}`);
export const bulkUpdateExtensions = (basicsId, extensions) =>
  http("POST", `/api/extensions/basics/${basicsId}/bulk`, { extensions });

// Milestones
export const getMilestonesByBasicsId = (basicsId) =>
  http("GET", `/api/milestones/basics/${basicsId}`);
export const getMilestone = (id) => http("GET", `/api/milestones/${id}`);
export const createMilestone = (payload) =>
  http("POST", "/api/milestones", payload);
export const updateMilestone = (id, payload) =>
  http("PUT", `/api/milestones/${id}`, payload);
export const toggleMilestone = (id) =>
  http("PATCH", `/api/milestones/${id}/toggle`);
export const deleteMilestone = (id) =>
  http("DELETE", `/api/milestones/${id}`);
export const deleteMilestonesByBasicsId = (basicsId) =>
  http("DELETE", `/api/milestones/basics/${basicsId}`);
export const bulkUpdateMilestones = (basicsId, milestones) =>
  http("POST", `/api/milestones/basics/${basicsId}/bulk`, { milestones });

// Bidder Details
export const getBidderDetailsByBasicsId = (basicsId) =>
  http("GET", `/api/bidderdetails/basics/${basicsId}`);
export const getBidderDetails = (id) =>
  http("GET", `/api/bidderdetails/${id}`);
export const createOrUpdateBidderDetails = (payload) =>
  http("POST", "/api/bidderdetails", payload);
export const updateBidderDetails = (id, payload) =>
  http("PUT", `/api/bidderdetails/${id}`, payload);
export const deleteBidderDetails = (id) =>
  http("DELETE", `/api/bidderdetails/${id}`);
export const deleteBidderDetailsByBasicsId = (basicsId) =>
  http("DELETE", `/api/bidderdetails/basics/${basicsId}`);

// Bidders
export const getBiddersByBasicsId = (basicsId) =>
  http("GET", `/api/bidderdetails/basics/${basicsId}/bidders`);
export const createBidder = (payload) =>
  http("POST", "/api/bidderdetails/bidders", payload);
export const updateBidder = (id, payload) =>
  http("PUT", `/api/bidderdetails/bidders/${id}`, payload);
export const deleteBidder = (id) =>
  http("DELETE", `/api/bidderdetails/bidders/${id}`);
export const deleteBiddersByBasicsId = (basicsId) =>
  http("DELETE", `/api/bidderdetails/basics/${basicsId}/bidders`);
export const bulkUpdateBidders = (basicsId, bidders) =>
  http("POST", `/api/bidderdetails/basics/${basicsId}/bidders/bulk`, { bidders });
