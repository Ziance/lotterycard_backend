import { Request, Response } from "express";
import AppDataSource from "../ormconfig";
import * as jwt from "jsonwebtoken";
import { User } from "../entity/User";
import config from "../config/config";
import { compareText, hashText } from "../helper/bcrypt";
import { sendEmail } from "./mailservice";
import { url } from "inspector";
import base64url from "base64url";

class AuthController {

  static RETRY_COUNT = 5;

  static login = async (req: Request, res: Response) => {
    //Check if username and password are set
    let { userName, password } = req.body;
    console.log("requestttt", req.body);
    if (!(userName && password)) {
      return res.status(400).json({ message: "Username and password required" });
    }
    //Get user from database
    const userRepository = AppDataSource.getRepository(User);
    try {
      const user: User = await userRepository.findOneOrFail({
        where: {
          userName: userName.trim(),
          isDeleted: false,
        },
      });

      if (user) {

        if (!user.isActive) {
          return res.status(401).json({ message: "Your account is deactivated, Please reach to support." });
        }

        const myPassword = await compareText(password.trim(), user.passwordHash);
        if (!myPassword) {
          const result = await this.updateUserRetryCount(user.userName, user.retryCount);
          return res.status(401).json({ message: result ? "Your password is invalid. Try again." : "Your account is deactivated, Please reach to support." });
        } else {
          await this.updateUserRetryCount(user.userName, -1);
        }
      } else {
        return res.status(401).json({ message: "We are not able identify user with given username." });
      }

      const token = jwt.sign({ userId: user.userId }, config.jwtSecret, {
        expiresIn: "24h",
      });
      user["token"] = token;
      return res.status(200).json({ message: "You are logged in successfully.", user });

    } catch (error) {
      return res.status(401).json({ message: "We are not able identify user with given username." });
    }
  };







  static updateUserRetryCount = async (username: string, currentCount: number) => {
    const userRepository = AppDataSource.getRepository(User);
    const isActive = (currentCount + 1) < AuthController.RETRY_COUNT;
    userRepository.createQueryBuilder().update(User).set({
      retryCount: isActive ? currentCount + 1 : 0,
      isActive: isActive,
    })
      .where("userName = :username", { username: username })
      .execute();
    return isActive;
  }
  static loginwithgmail = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please enter email address." });
    }

    //Get user from database
    const userRepository = AppDataSource.getRepository(User);
    try {
      const user: User = await userRepository.findOneOrFail({
        where: { email: email.trim() },
      });
      const token = jwt.sign({ userId: user.userId }, config.jwtSecret, {
        expiresIn: "24h",
      });
      user["token"] = token;
      return res.status(200).json({ message: "You are logged in successfully.", user });
    } catch (error) {
      return res.status(401).json({ message: "Given email address not found. please register first." });
    }
  };




  static forgotpassword = async (req: Request, res: Response) => {
    console.log("forgotpassword.......... callledddsads")
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ message: "email required" });
    }
    const userRepository = AppDataSource.getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({
        where: { email: email },
      });
      if(!user){
        return res.status(404).json({
          message : "user not found"
        })
      }
      console.log("userr is : " , user)
      const webUrl = "http://localhost:3000/reset-password";
      const defaultEmailoptions = {
        to: email,
        subject: `Forgot Password`,
        template: 'forgotpassword',
      };
      const userData = {
        name: user.firstName + ' ' + user.lastName,
        webUrl,
      };
      await sendEmail(defaultEmailoptions, userData)
      return res.status(200).json({ message: "We have sent you an email with the instruction to reset your email."});
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };



  static resetpassword = async (req: Request, res: Response) => {
    //email user submitted
    const { token, password } = req.body;
    let userId = 1;
    // if (!(token && password)) {
    //   return res.status(400).json({ message: "Token and password required" });
    // }
    try {
      // try {
      //   const jwtPayload: any = jwt.verify(token, config.jwtSecret);
      //   userId = jwtPayload.userId;
      // } catch(e) {
      //   return res.status(401).json({message: "Your token expired. kindly send request again."});
      // }
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneOrFail({
        where: { userId: "1" },
      });

      if (user) {
        const hashPassword = await hashText(password);
        userRepository.createQueryBuilder().update(User).set({
          passwordHash: hashPassword,
        })
          .where("userId = :userId", { userId: user.userId })
          .execute();
        return res.status(200).json({ message: "Your password reset successfully." })
      }

    } catch (error) {
      return res.status(401).json({ message: "We are not able to identify user based on token." });
    }
  };
}
export default AuthController;
