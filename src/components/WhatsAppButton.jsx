import React from "react";
import "./WhatsAppButton.css";
import { SUPPORT_WHATSAPP_URL } from "../constants/supportContact.js";

export default function WhatsAppButton() {
  return (
    <a
      href={SUPPORT_WHATSAPP_URL}
      className="whatsapp-btn"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
    </a>
  );
}
