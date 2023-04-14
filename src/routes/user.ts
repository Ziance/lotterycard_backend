import { Router } from "express";
import UserController from "../controller/UserController";
import { checkAccessTokenValidation } from "../middleware/checkjwt";

const router = Router();

// Get all users
router.get("/", UserController.getUser);
router.post("/add", UserController.addUser);
router.get("/:userId", UserController.getUserById);
router.put("/edit/:userId", UserController.updateUser);
router.delete("/delete/:userId",UserController.deleteUser);

export default router;
