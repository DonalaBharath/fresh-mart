import api from "../api/api";

export const sendContactMessage = (data) =>
  api.post("/contact", data);