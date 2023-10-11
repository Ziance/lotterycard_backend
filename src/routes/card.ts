import { Router } from "express";
import CardController from "../controller/CardController";

const router = Router();

router.post("/placebid/:userId", CardController.placebid);
router.get("/getAllBids/", CardController.getBid);
router.get("/winner-cards", CardController.getWinnersCardList);
router.get("/winner", CardController.getWinner);
router.get("/getUserBidHistory/:userId", CardController.getUserBidHistory);
router.get("/getcards", CardController.getallcards);
router.get("/manually-session", CardController.manuallySessionCalledTest);
router.post("/changeCard/:userId",CardController.changeCards)
router.post("/addCredits/:userId", CardController.addMoreCredits);

// this is for testing only

export default router;
