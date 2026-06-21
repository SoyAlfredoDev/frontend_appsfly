import axios from "./axios.js";

export const getEmailProspectsRequest = (params = {}) =>
    axios.get("/admin/email-prospects", { params });

export const createEmailProspectRequest = (data) =>
    axios.post("/admin/email-prospects", data);

export const importEmailProspectsRequest = (data) =>
    axios.post("/admin/email-prospects/import", data);

export const downloadProspectImportTemplateRequest = async () => {
    const res = await axios.get("/admin/email-prospects/import-template", {
        responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilla-prospectos-appsfly.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

export const PROSPECT_IMPORT_TEMPLATE_LOCAL = `email,nombre,empresa,notas
contacto@empresa.cl,Juan,Óptica Central,Opcional
otro@negocio.cl,Maria,Retail Sur,`;

export const resubscribeEmailProspectRequest = (prospectId) =>
    axios.post(`/admin/email-prospects/${prospectId}/resubscribe`);

export const deleteEmailProspectRequest = (prospectId) =>
    axios.delete(`/admin/email-prospects/${prospectId}`);

export const getProspectUnsubscribeInfoRequest = (token) =>
    axios.get(`/prospects/unsubscribe/${token}`);

export const unsubscribeProspectRequest = (token) =>
    axios.post(`/prospects/unsubscribe/${token}`);
