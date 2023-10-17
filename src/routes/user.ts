import { Router } from "express";
import UserController from "../controller/UserController";
import { checkAccessTokenValidation } from "../middleware/checkjwt";
import multer from 'multer';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
    destination: (req:any, file:any, cb:any) => {
        cb(null, './public/uploads');
    },
    filename: (req:any, file:any, cb:any) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage }).single('file');
// Get all users
router.get("/", UserController.getUser);
router.post("/add", upload, UserController.addUser);
router.get("/:userId", UserController.getUserById);
router.put("/edit/:userId", upload, UserController.updateUser);
router.delete("/delete/:userId", UserController.deleteUser);



export default router;
