import { Router } from "express";
import {
  createStudent,
  listStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  generateQR,
  regenerateQR,
  downloadQR,
} from "./controller";
import { protect } from "../../middlewares/auth";

const router = Router();

// Create Student
router.post("/", protect, createStudent);

// List Students
router.get("/", protect, listStudents);

// Get Single Student
router.get("/:id", protect, getStudent);

// Update Student
router.put("/:id", protect, updateStudent);

// Delete Student
router.delete("/:id", protect, deleteStudent);
// QR Code Operations
router.post("/:id/generate-qr", protect, generateQR);
router.put("/:id/regenerate-qr", protect, regenerateQR);
router.get("/:id/download-qr", protect, downloadQR);

export default router;