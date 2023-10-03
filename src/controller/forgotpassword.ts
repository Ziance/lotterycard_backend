import bodyParser from "body-parser";
import { sendEmail } from "./mailservice";
import AppDataSource from "../ormconfig";
import { User } from "../entity/User";
import { isStrongPassword } from "class-validator";
import { hashText } from "../helper/bcrypt";


const CryptoJS = require("crypto-js");
const SECRET_KEY = "lottery-app"
​

export const forgotPassword = async (req, res, next) => {
  console.log("forgotpasword........", req.body.email);
  
  const email = req.body.email;
  const id = req.body.id;
  const name= req.body.name;
  const date = new Date();

const encryptData = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString().replace('/','sls');
};
  // const newPassword = await generateRandomPassword(8, true);
  //  const encryptPassword = await encrypt(newPassword);
  // const user = await User.findOneAndUpdate(
  //   { email },
  //   { $set: { password: encryptPassword } },
  //   { new: true }
  // );



  const userRepository = AppDataSource.getRepository(User);
  let user: User;
  try {
    user = await userRepository.findOneOrFail({
      where: {
        email: email
      }
    });
    console.log("userrrrrrrrrrrr",user);
    
    if (!user) {
      throw { status: 404, message: 'Email not found.' };
    } else {


      // let characters =
      //   'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      // let password = '';
      // for (let i = 0; i < 8; i++) {
      //   const randomIndex = Math.floor(Math.random() * characters.length);
      //   password += characters.charAt(randomIndex);
      // }
      // const newPassword = await hashText(password);


      // const defaultEmailoptions = {
      //   to: email,
      //   subject: `Forgot Password`,
      //   template: 'forgotpassword',
      // };
      // const userData = {
      //   name: user.firstName + ' ' + user.lastName,
      //   password,
      // };
      // console.log("userData",userData);
      
      // const emailObj = await sendEmail(defaultEmailoptions);
      // console.log("emailObj",emailObj);

      // userRepository.createQueryBuilder().update(User).set({
      //   passwordHash: newPassword
      // })
      //  .where({email: email})
      // .execute();



      return res.status(200).json({ message: "link  sent successfully in mail."});
    }
  }
  catch (error) {

    return res.status(401).json({ message: "Something went wrong." , error });

  }
};