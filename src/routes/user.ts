import { Router } from "express";
import UserController from "../controller/UserController";
import { checkAccessTokenValidation } from "../middleware/checkjwt";

const router = Router();

// Get all users
router.get("/", checkAccessTokenValidation, UserController.getUser);
router.post("/add",UserController.addUser);
router.get("/:userId",checkAccessTokenValidation, UserController.getUserById);
router.put("/edit/:userId",checkAccessTokenValidation, UserController.updateUser);
router.delete("/delete/:userId", checkAccessTokenValidation,UserController.deleteUser);

export default router;
