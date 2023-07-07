import { Request, Response } from "express";
import AppDataSource from "../ormconfig";
import { Credit } from "../entity/Credit";
import { Bid } from "../entity/Bid";
import moment from "moment";

class CardController {
  public static placebid = async (req: Request, res: Response) => {
    const user = req.params.userId;

    if (!user) {
      return res.status(400).json({ error: "User parameter is missing" });
    }

    try {
      const existingUser = AppDataSource.getRepository(Credit);
      const data = await existingUser.findOne({
        where: {
          userId: user,
        },
      });

      if (!data) {
        return res.status(404).json({ error: "User not found" });
      }

      if (data.credits < 1) {
        return res.status(403).json({ error: "Insufficient credits" });
      }

      data.credits -= 1;
      const results = await AppDataSource.getRepository(Credit).save(data);

      const addbidrecord = await AppDataSource.getRepository(Bid);
      const bidData = await addbidrecord.findOne({
        where: {
          userId: user,
        },
      });
      if (bidData) {
        const storedDate = moment(bidData.date).utc();
        const inputDate = moment().utc();
        if (
          bidData &&
          storedDate.isBefore(inputDate) &&
          bidData.userId == user
        ) {
          return res.json({
            message: "You have alredy placed the bid wait for the results",
          });
        }
        bidData.userId = user;
        bidData.date = moment().utc().toDate();
        const insert = await AppDataSource.getRepository(Bid).save(bidData);
      } else {
        const createbid = await AppDataSource.getRepository(Bid).create();
        createbid.userId = user;
        createbid.date = moment().utc().toDate();
        const insert = await AppDataSource.getRepository(Bid).save(createbid);
      }
      return res.json({
        message: "Bid placed successfully",
        newCredit: data.credits,
      });
    } catch (error) {
      console.error("Failed to place bid:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
export default CardController;
