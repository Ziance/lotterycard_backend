import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
// import EmailHistory from '../models/emailHistory.model';
// import { failureResponse } from '../helpers/api-response.helper';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ztdeveloper7@gmail.com',
    pass: 'whizinhbbmyjyled',
  },
});

export const sendEmail = async (defaultOption, data) => {
  console.log("sendEmail",defaultOption);

  const templatePath = path.join(
    __dirname,
    `../templates/${defaultOption.template}.ejs`
  );
  const htmlContent = await ejs.renderFile(templatePath, data);
  try {
    const info = await transporter.sendMail({
      from: `lottery@gmail.com`,
      to: defaultOption.to,
      subject: defaultOption.subject,
      html: htmlContent,
    });
    if (!info) {
      throw { status: 404, message: 'Email not sent.' };
    } else {
      const mailObj = {
        to: info.envelope.to,
        from: info.envelope.from,
        status: info.response,
        content: htmlContent,
        subject: defaultOption.subject,
      };
      // const newEmailObj = new EmailHistory(mailObj);
      // const savedObj = await newEmailObj.save();
      if (!info) {
        throw { status: 404, message: 'Error while save email record.' };
      }
      console.log("infoooooo",info);
      
      return info;
    }
  } catch (error) {
    console.log("error in email service");
    
    // return failureResponse(
    //   null,
    //   error.status || 500,
    //   error,
    //   error.message || 'Something went wrong'
    // );
  }
};