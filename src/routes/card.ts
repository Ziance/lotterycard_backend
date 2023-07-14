import { Router } from "express";
import CardController from "../controller/CardController";

const router = Router();


router.get("/placebid/:userId",CardController.placebid);
router.get("/getCreditsByUserId/:userId",CardController.getCredits)
router.get("/getAllBids/",CardController.getBid)
router.get("/winner", CardController.getWinner)
router.post("/createUserBidHistory", CardController.createUserBidHistory)
router.get ("/getUserBidHistory/:userId", CardController.getUserBidHistory)
export default router;