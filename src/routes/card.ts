import { Router } from "express";
import CardController from "../controller/CardController";

const router = Router();

router.post("/combo-placebid/:userId", CardController.placeBidCombo);
router.post("/placebid/:userId", CardController.placebid);
router.get("/getAllBids/", CardController.getBid);
router.get("/winner-cards", CardController.getWinnersCardList);
router.get("/winner", CardController.getWinner);
router.get("/getUserComboBidHistory/:userId", CardController.getUserComboBidHistory);
router.get("/getUserBidHistory/:userId", CardController.getUserBidHistory);
router.get("/getcards", CardController.getallcards);
router.post("/changeCard/:userId",CardController.changeCards)
router.post("/addCredits/:userId", CardController.addMoreCredits);
router.get("/get-current-session-bids", CardController.getCurrentSessionBids);

// this is for testing only

export default router;
