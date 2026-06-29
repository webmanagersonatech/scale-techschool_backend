import { Router } from "express";
import {
  createContact,
  listContacts,
  updateContact,
  deleteContact,
} from "./controller";
import { protect } from "../../middlewares/auth";

const router = Router();


router.post("/", createContact);


router.get("/", protect, listContacts);


router.put("/:id", protect, updateContact);


router.delete("/:id", protect, deleteContact);

export default router;
