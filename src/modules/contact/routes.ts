import { Router } from "express";
import {
  createContact,
  listContacts,
  updateContact,
  deleteContact,
} from "./controller";
import { protect } from "../../middlewares/auth";

const router = Router();

/* ---------- PUBLIC ROUTE ---------- */
// Submit a contact form (any user)
router.post("/", createContact);

/* ---------- PROTECTED ROUTES ---------- */
// List all contacts (admin)
router.get("/", protect, listContacts);

// Update a contact (admin)
router.put("/:id", protect, updateContact);

// Delete a contact (admin)
router.delete("/:id", protect, deleteContact);

export default router;
