import { Router } from "express";
import CardController from "../controller/CardController";

const router = Router();


router.get("/placebid/:userId",CardController.placebid);

export default router;