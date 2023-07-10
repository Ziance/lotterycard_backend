import { Router } from "express";
import CardController from "../controller/CardController";

const router = Router();


router.get("/placebid/:userId",CardController.placebid);
router.get("/getCreditsByUserId/:userId",CardController.getCredits)
router.get("/getAllBids/",CardController.getBid)
router.get("/winner", CardController.getWinner)

export default router;