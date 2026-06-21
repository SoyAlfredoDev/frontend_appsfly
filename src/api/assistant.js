import axios from "./axios.js";

export const getAssistantStatusRequest = () => axios.get("/assistant/status");

export const sendAssistantMessageRequest = (messages) =>
    axios.post("/assistant/chat", { messages });
