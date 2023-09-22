import { Router } from "express";
import CardController from "../controller/CardController";

const router = Router();

router.post("/placebid/:userId", CardController.placebid);
router.get("/getAllBids/", CardController.getBid);
router.get("/winner", CardController.getWinner);
router.get("/getUserBidHistory/:userId", CardController.getUserBidHistory);
router.get("/getcards", CardController.getallcards);
router.post("/changeCard/:userId",CardController.changeCards)
router.post("/addCredits/:userId", CardController.addMoreCredits);
export default router;
