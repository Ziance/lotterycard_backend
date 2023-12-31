import { Request, Response } from "express";
import { User } from "../entity/User";
import { hashText } from "../helper/bcrypt";
//import { sendEmail } from "../helper/emailHelper";
import AppDataSource from "../ormconfig";
import Template from "../response/index";
class UserController {


  public static getUser = async (req: Request, res: Response) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const data = await userRepository.find({
        where: {
          isDeleted: false
        }
      })
      return res.json(Template.success("User Fetched Succesfully", data));
    } catch (error) {
      return res.status(401).json(Template.userNotFound());
    }
  };



  public static getUserById = async (req: Request, res: Response) => {
    try {
      let userId = req.params.userId;
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.find({
        where: {
          userId: userId,
          isDeleted: false
        }
      })
      if (user.length) {
        return res.json(Template.success("Users Feated succesfully", user));
      }
      return res.status(401).json(Template.userNotFound());
    } catch (error) {
      return res.status(401).json(Template.userNotFound());
    }
  };


  public static addUser = async (req: any, res: Response, next: any) => {
    console.log("request", req);
    let serverBaseUrl = ""

    try {

      // if (req && req?.file) {
      //   console.log('file--> ', req?.file);
      //   serverBaseUrl = `http://localhost:${process.env.DB_PORT}/ftp/uploads/`;

      // }
      const {
        firstName,
        lastName,
        phone,
        userName,
        email,
        // address,
        password
      } = req.body;
      const hashPassword = await hashText(password);
      const userRepository = AppDataSource.getRepository(User);
      const userExists = await userRepository.find({
        where: {
          userName: userName?.trim(),
          isDeleted: false
        }
      })

      if (userExists.length) {
        return res.status(403).json({ message: "User already exists" });
      }


      const user = AppDataSource.getRepository(User).create({
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        userName: userName.trim(),
        email: email,
        // address: address,
        passwordHash: hashPassword,
        credits: 53,
        // file: (serverBaseUrl + req?.file?.filename)
      });
      console.log("userwwwwwwww", user);

      const results = await AppDataSource.getRepository(User).save(user);
      //await sendEmail(email, "Welcome To lottery", "Welcome to lottery, continue using our application.");
      return res.json(Template.success("Users Created Succesfully", results));
    } catch (error) {
      return res.status(401).json({ message: "error occured", error });
    }
  };

  private static _updateUser = async (req: any, res: Response) => {
    console.log("updateUser : ", req.body);
    try {
      let serverBaseUrl = "";
      if (req && req?.file) {
        console.log('file--> ', req?.file);
        serverBaseUrl = `http://localhost:${process.env.DB_PORT}/ftp/uploads/`;
      }
      const userId = await AppDataSource.getRepository(User).findOne({
        where: {
          userId: req.params.userId,
        },
      });
      console.log("user id", userId);

      if (!userId) {
        return res.status(401).json(Template.userNotFound());
      }
      // req.body['file'] =
      // console.log("req.body['file']", req.body['file']);


      let tempData = req.body;
      tempData['file'] = serverBaseUrl + req?.file?.filename;
      // .set(...tempData)
      console.log("request. body", tempData);
      await AppDataSource.getRepository(User)
        .createQueryBuilder()
        .update(User)
        .set(
          // ...req.body,
         { ...tempData}
          // updatedBy: res.locals.jwt.userId,
        )
        .where("userId = :userId", { userId: req.params.userId })
        .execute();

      console.log("new loggggg");

      const userRepository = AppDataSource.getRepository(User);
      console.log("user repo", userRepository);

      const user = await userRepository.find({
        where: {
          userId: req.params.userId,
          isDeleted: false
        }
      });
      console.log("user", user);

      if (user.length) {
        return res.json(Template.success("Users Updated succesfully", user));
      }
      return res.status(401).json(Template.userNotFound());
    } catch (error) {
      console.log("error", error);

    }

  };
  public static get updateUser() {
    return UserController._updateUser;
  }
  public static set updateUser(value) {
    UserController._updateUser = value;
  }


  public static deleteUser = async (req: Request, res: Response) => {
    const userId = await AppDataSource.getRepository(User).findOne({
      where: {
        userId: req.params.userId,
      },
    });
    if (!userId) {
      return res.status(401).json(Template.userNotFound());
    }
    await AppDataSource.getRepository(User)
      .createQueryBuilder()
      .update(User)
      .set({
        isDeleted: true,
      })
      .where("userId = :userId", { userId: req.params.userId })
      .execute();
    return res.json(Template.success("User delete succesfully"));
  };


}
export default UserController;
