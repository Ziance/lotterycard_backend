import { Router } from "express";
import CardController from "../controller/CardController";

const router = Router();


router.post("/placebid/:userId",CardController.placebid);
router.get("/getCreditsByUserId/:userId",CardController.getCredits)
router.get("/getAllBids/",CardController.getBid)
router.get("/winner", CardController.getWinner)
router.post("/createUserBidHistory", CardController.createUserBidHistory)
router.get ("/getUserBidHistory/:userId", CardController.getUserBidHistory)
// router.get("/getcards", CardController.fetchcards)
router.get("/getcards",CardController.getallcards)
router.post("/getCreditsByUserId/:userId",CardController.addMoreCredits)
export default router;