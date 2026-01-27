import { Router } from "express";
import {
    createWillingJoiner,
    listWillingJoiners,
    updateWillingJoiner,
    deleteWillingJoiner,
} from "./controller";

const router = Router();

/* ================= WILLING JOINER ROUTES ================= */


router.post("/", createWillingJoiner);

// 📃 List all joiners
router.get("/", listWillingJoiners);

// ✏️ Update joiner (status, course, etc.)
router.put("/:id", updateWillingJoiner);


router.delete("/:id", deleteWillingJoiner);

export default router;
