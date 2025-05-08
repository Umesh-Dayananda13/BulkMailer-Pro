

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/send-mails", async (req, res) => {
    const { emails, subject, message } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const mailOptions = emails.map((email) => ({
            from: process.env.GMAIL_USER,
            to: email,
            subject,
            text: message,
        }));

        for (let mail of mailOptions) {
            await transporter.sendMail(mail);
        }

        res.status(200).json({ success: true, message: "Emails sent!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to send emails." });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
