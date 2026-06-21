import axios from "../api/axios.js";

export const getAgentTasksRequest = () => axios.get("/admin/agent-tasks");

export const createAgentTaskRequest = (data) => axios.post("/admin/agent-tasks", data);

export const updateAgentTaskStatusRequest = (taskId, data) =>
    axios.patch(`/admin/agent-tasks/${taskId}/status`, data);

export const deleteAgentTaskRequest = (taskId) => axios.delete(`/admin/agent-tasks/${taskId}`);

export const getAgentTaskCursorPromptRequest = () =>
    axios.get("/admin/agent-tasks/cursor-prompt");
