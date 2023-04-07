import { Router } from "express";
import AuthController from "../controller/AuthController"


const router = Router();
//Login route
router.post("/login", AuthController.login);
//check User details with email
router.post("/loginwithgmail",AuthController.loginwithgmail)

// for forgot password.
router.post("/forgotpassword", AuthController.forgotpassword);

router.post("/resetpassword", AuthController.resetpassword);


export default router;