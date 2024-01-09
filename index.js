import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import * as nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  TO_EMAIL,
  MESSAGES_PER_DAY,
  PROXIES,
} = process.env;

app.set("trust proxy", parseInt(PROXIES));

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, //24 hours
  max: parseInt(MESSAGES_PER_DAY),
  message: "Too many requests from this IP, please try again later",
});

app.use(limiter);

app.use(cors());

app.options("*", cors());

app.post("/", async (req, res) => {
  console.log(req.body);
  const { name, phone, email, body } = req.body;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  try {
    const info = await transporter.sendMail({
      from: SMTP_USER,
      to: TO_EMAIL,
      subject: "New webhook email",
      text:
        `Name: ${name}\n` + `Email: ${email}\n` + `Phone: ${phone}\n\n` + body,
      replyTo: email,
    });
    console.log("Message sent: " + info.messageId);
    res.sendStatus(200);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Email failed to send");
  }
});

app.listen(8000, () => console.log("Listening on port 8000"));
