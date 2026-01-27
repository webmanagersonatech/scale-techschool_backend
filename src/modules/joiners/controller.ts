import { Request, Response } from "express";
import WillingJoiner from "./model"; // your WillingJoiner model
import { AuthRequest } from "../../middlewares/auth";
import { createWillingJoinerSchema } from "./joiner.sanitize";

/* ================= EMAIL SETUP ================= */
const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey =
  process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/* ================= CREATE JOINER ================= */
export const createWillingJoiner = async (req: Request, res: Response) => {
  try {
    /* ---------- VALIDATION ---------- */
    const { error, value } = createWillingJoinerSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { name, email, phone, course } = value;

    /* ---------- DUPLICATE CHECK ---------- */
    const existing = await WillingJoiner.findOne({
      $or: [{ email }, { phone }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Joiner already exists",
      });
    }

    /* ---------- CREATE JOINER ---------- */
    const joiner = await WillingJoiner.create({
      name,
      email,
      phone,
      course,
    });

    /* ---------- SEND THANK YOU EMAIL ---------- */
    await emailApi.sendTransacEmail({
      sender: { email: "vinor1213@gmail.com", name: "Vinoth" },
      to: [{ email, name }],
      subject: "Thank you for joining!",
      htmlContent: `
        <h2>Hello ${name},</h2>
        <p>Thank you for showing interest in our <b>${course}</b> program.</p>
        <p>Our team will contact you shortly.</p>
        <br/>
        <p>Regards,<br/>Team</p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Successfully joined the course",
      data: joiner,
    });
  } catch (error: any) {
    console.error("Create joiner error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/* ================= LIST JOINERS ================= */
export const listWillingJoiners = async (req: AuthRequest, res: Response) => {
  try {
    const joiners = await WillingJoiner.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: joiners,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPDATE JOINER ================= */
export const updateWillingJoiner = async (req: AuthRequest, res: Response) => {
  try {
    const updated = await WillingJoiner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Joiner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Joiner updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= DELETE JOINER ================= */
export const deleteWillingJoiner = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not authorized" });

    if (user.role === "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const deleted = await WillingJoiner.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Joiner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Joiner deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
