import * as bcrypt from "bcryptjs";
const CryptoJS = require("crypto-js");
const SECRET_KEY = "lottery-app"

export const hashText = async (text: any) => {
  try {
    const result = await bcrypt.hash(text.trim(), 10);
    return result;
  } catch (error) {
    console.error("Hash Text Error: ", error);
  }
};

export const compareText = async (text: any, hash_text: any) => {
  try {
    const result = await bcrypt.compare(text.trim(), hash_text);
    return result;
  } catch (error) {
    console.error("Compare Text Error: ", error);
  }
};


​
//Encrypting text
export const encryptData = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString().replace('/','sls');
};
​


// Decrypting text
export const decryptData = (text) => {
    return CryptoJS.AES.decrypt(text.toString(), SECRET_KEY).toString(CryptoJS.enc.Utf8).replace('sls', '/');
};
