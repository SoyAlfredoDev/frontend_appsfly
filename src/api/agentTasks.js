import axios from "./axios.js";

const LOCAL_TOKEN = import.meta.env.VITE_AGENT_TASKS_LOCAL_TOKEN?.trim() ?? "";

function localHeaders() {
    if (!LOCAL_TOKEN) return {};
    return { "X-AppsFly-Agent-Token": LOCAL_TOKEN };
}

export const getAgentTasksAccessRequest = () =>
    axios.get("/admin/agent-tasks/access", { headers: localHeaders() });

export const getAgentTasksRequest = () =>
    axios.get("/admin/agent-tasks", { headers: localHeaders() });

export const getAgentTaskQueueRequest = () =>
    axios.get("/admin/agent-tasks/queue", { headers: localHeaders() });

/** Crear tareas: no requiere token local (móvil). */
export const createAgentTaskRequest = (data) => axios.post("/admin/agent-tasks", data);

export const updateAgentTaskStatusRequest = (taskId, data) =>
    axios.patch(`/admin/agent-tasks/${taskId}/status`, data, { headers: localHeaders() });

export const deleteAgentTaskRequest = (taskId) =>
    axios.delete(`/admin/agent-tasks/${taskId}`, { headers: localHeaders() });
