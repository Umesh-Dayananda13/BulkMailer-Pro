import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import * as XLSX from "xlsx";
import axios from "axios";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  FiUploadCloud,
  FiSend,
  FiCheckCircle,
  FiEye,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import "./App.css";

const LoadingSpinner = () => (
  <div className="spinner">
    <div className="double-bounce1"></div>
    <div className="double-bounce2"></div>
  </div>
);

function App() {
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (
      file.type !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Please upload a valid Excel file (.xlsx)",
        confirmButtonColor: "#ff4d4d",
      });
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const extractedEmails = data
        .flat()
        .filter((cell) => typeof cell === "string" && emailRegex.test(cell.trim()));
      if (extractedEmails.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Valid Emails",
          text: "No valid email addresses found in the file.",
          confirmButtonColor: "#ff4d4d",
        });
        return;
      }
      setEmails([...new Set([...emails, ...extractedEmails])]);
    };
    reader.readAsBinaryString(file);
  };

  const handleSend = async () => {
    if (emails.length === 0 || !subject || !message) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "\uD83D\uDEA8 Please fill all required fields!",
        confirmButtonColor: "#ff4d4d",
      });
      return;
    }
    setIsSending(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.post(`${apiUrl}/send-mails`, { emails, subject, message });
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "\uD83C\uDF89 Emails sent successfully!",
        confirmButtonColor: "#00d084",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Send Failed",
        text:
          "\u274C Error sending emails: " +
          (err.response?.data?.message || err.message),
        confirmButtonColor: "#ff4d4d",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleAddEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(emailInput.trim())) {
      setEmails((prev) => [...new Set([...prev, emailInput.trim()])]);
      setEmailInput("");
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#ff4d4d",
      });
    }
  };

  const handleClear = () => {
    setEmails([]);
    setSubject("");
    setMessage("");
    setSelectedFile(null);
    setPreviewMode(false);
    setEmailInput("");
  };

  return (
    <div className="container">
      <div className="card">
        <h1>BulkMailer Pro </h1>
        <h2 style={{textAlign: "center", color: "skyblue",}}>&rarr;&reg;UMESH&trade;</h2>

        <div className="upload-section"id="upload-section" >
          <label className="file-upload">
            <input type="file" onChange={handleFileUpload} />
            <div className="upload-content">
              <FiUploadCloud size={24} />
              <span>
                {selectedFile ? selectedFile.name : "Upload Excel File (.xlsx)"}
              </span>
              {selectedFile && <FiCheckCircle color="#0f0" />}
            </div>
          </label>
        </div>

        <div className="input-group" >
          <input
            type="text"
            placeholder="Add email manually"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
          <button onClick={handleAddEmail} className="preview-btn">
            <FiPlus /> Add
          </button>
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="input-group">
          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="6"
          ></textarea>
        </div>

        <div className="button-group">
          <button className="send-btn" onClick={handleSend} disabled={isSending}>
            {isSending ? <LoadingSpinner /> : <FiSend />}
            {isSending ? "Sending..." : "Send Emails"}
          </button>
          <button className="clear-btn" onClick={handleClear}>
            <FiTrash2 /> Clear
          </button>
          <button className="preview-btn" onClick={() => setPreviewMode((p) => !p)}>
            <FiEye /> Preview
          </button>
        </div>

        {previewMode && (
          <div className="preview-box">
            <h3>📬 Preview</h3>
            <p>
              <strong>Subject:</strong> {subject}
            </p>
            <p>
              <strong>Message:</strong>
            </p>
            <pre>{message}</pre>
          </div>
        )}

        {emails.length > 0 && (
          <div className="list-container">
            <h3>Recipients ({emails.length})</h3>
            {emails.map((email, index) => (
              <div key={index} className="email-item">
                <span>{email}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
