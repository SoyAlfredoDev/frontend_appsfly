import axios from "./axios.js"

export const getTotalFromColumn = (tableName, columnName) => axios.get(`/utils/total/${tableName}/${columnName}`);

export const deleteByTableAndId = (tableName, id) => axios.delete(`/utils/delete/${tableName}/${id}`);

export const getCountDataTable = (tableName) => axios.get(`/utils/count/${tableName}`);
