import express from "express";
import { config } from "dotenv";
import cors from "cors";
import mongoose from "mongoose"
import { sendEmail } from "./utils/sendEmail.js";

const app = express();
const router = express.Router();

config({ path: "./config.env" });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
 mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true, }); 
 const db = mongoose.connection; 
 db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => { console.log('Connected to MongoDB'); }); 
  // Define a Mongoose schema and model 
const contactSchema = new mongoose.Schema({
   name: String,
   email: String,
   message: String, 
   date: { type: Date, default: Date.now } }); 
const Contact = mongoose.model('Contact', contactSchema);

router.post("/send/mail", async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return next(
      res.status(400).json({
        success: false,
        message: "Please provide all details",
      })
    );
  }
  try {
    await sendEmail({
      email: "projectassistant01@gmail.com",
      subject: "GYM WEBSITE CONTACT",
      message,
      userEmail: email,
    });
   // Save contact details to MongoDB 
  const contact = new Contact({ name, email, message });
   await contact.save();
  res.status(200).json({ success: true, message: "Message Sent Successfully.", }); 
} catch (error) { res.status(500).json({ 
  success: false,
   message: "Internal Server Error", 
  });
 } 
});
app.use(router);

app.listen(process.env.PORT, () => {
  console.log(`Server listening at port ${process.env.PORT}`);
});