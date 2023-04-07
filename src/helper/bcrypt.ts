import * as bcrypt from "bcryptjs";

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
