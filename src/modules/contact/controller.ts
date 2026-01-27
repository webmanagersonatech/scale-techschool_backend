import { Request, Response } from "express";
import Contact from "./model"
import { AuthRequest } from "../../middlewares/auth";
import { createContactSchema } from "./contact.sanitize"; // Joi validation schema

/* ================= EMAIL SETUP ================= */
const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/* ================= CREATE CONTACT ================= */
export const createContact = async (req: Request, res: Response) => {
  try {
    /* ---------- VALIDATION ---------- */
    const { error, value } = createContactSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { firstName, lastName, email, phone, subject, message } = value;

    /* ---------- OPTIONAL DUPLICATE CHECK ---------- */
    const existing = await Contact.findOne({ email, phone });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a contact request",
      });
    }

    /* ---------- CREATE CONTACT ENTRY ---------- */
    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
    });

    /* ---------- SEND THANK YOU EMAIL ---------- */
    await emailApi.sendTransacEmail({
      sender: { email: "vinor1213@gmail.com", name: "Vinoth" },
      to: [{ email, name: `${firstName} ${lastName}` }],
      subject: "Thank you for contacting us!",
      htmlContent: `
        <h2>Hello ${firstName},</h2>
        <p>Thank you for reaching out regarding <b>${subject}</b>.</p>
        <p>Our team will get back to you shortly.</p>
        <br/>
        <p>Regards,<br/>Team</p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Contact request submitted successfully",
      data: contact,
    });
  } catch (error: any) {
    console.error("Create contact error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* ================= LIST CONTACTS ================= */
export const listContacts = async (req: AuthRequest, res: Response) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPDATE CONTACT ================= */
export const updateContact = async (req: AuthRequest, res: Response) => {
  try {
    const updated = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= DELETE CONTACT ================= */
export const deleteContact = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not authorized" });

    if (user.role === "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const deleted = await Contact.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
