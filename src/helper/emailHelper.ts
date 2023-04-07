const nodemailer = require("nodemailer");

export const sendEmail = async (to: string, subject: string,  html: string ) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "dineshvaghelaziance@gmail.com",
          pass: "aprqlfgtonogkwjo",
        },
      });

      // send email
      try {
        const emailResponse = await transporter.sendMail({
            from: 'dineshvaghelaziance@gmail.com',
            to: to,
            subject: subject,
            html: html
        });
        console.log("Email Sent", emailResponse);
      } catch(error) {
        console.log("Error", error);
      }
   
}