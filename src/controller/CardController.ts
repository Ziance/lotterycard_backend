import { Request, Response } from "express";
import AppDataSource from "../ormconfig";
import { Credit } from "../entity/Credit";
import { Bid } from "../entity/Bid";
import moment from "moment";
import Template from "../response/index";
import UserController from "./UserController";
import { User } from "../entity/User";
import cron from "node-cron";
import { Winner } from "../entity/winner";
const crypto = require("crypto");
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
        return res.status(401).json(Template.userNotFound());
      }

      if (data.credits < 1) {
        return res.status(403).json({ error: "Insufficient credits" });
      }

      data.credits -= 1;
      await AppDataSource.getRepository(Credit).save(data);

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
        await AppDataSource.getRepository(Bid).save(bidData);
      } else {
        const createbid = await AppDataSource.getRepository(Bid).create();
        createbid.userId = user;
        createbid.date = moment().utc().toDate();
        await AppDataSource.getRepository(Bid).save(createbid);
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
  public static getCredits = async (req: Request, res: Response) => {
    const userid = req.params.userId;

    if (!userid) {
      return res.status(400).json({ error: "User parameter is missing" });
    }
    try {
      const creditsRepository = AppDataSource.getRepository(Credit);
      const data = await creditsRepository.findOne({
        where: {
          userId: userid,
        },
      });
      if (!data) {
        console.log(data);
        return res.status(404).json(Template.userNotFound());
      } else {
        return res.json({
          message: "User Credits is",
          data,
        });
      }
    } catch (error) {
      console.error("Failed to place bid:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  public static getBid = async (req: Request, res: Response) => {
    try {
      const bidRepository = AppDataSource.getRepository(Bid);
      const data = await bidRepository.find();
      if (!data) {
        console.log(data);
        return res.status(404).json({ error: "No bid data found" });
      } else {
        return res.json({
          message: "Bid data is",
          data,
        });
      }
    } catch (error) {
      console.error("Failed to place bid:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  public static getWinner = async (req: Request, res: Response) => {
    try {
      const winnerRepository = AppDataSource.getRepository(Winner);
      const data = await winnerRepository.find();
      // console.log(data)
      const currentTime = new Date();

      // Calculate the start time for the previous one hour
      const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

      // Calculate the start time for the previous two hours
      const twoHoursAgo = new Date(currentTime.getTime() - 2 * 60 * 60 * 1000);

      // Filter the data based on the timestamp
      const previousOneHourData = data.filter(
        (item) =>
          item.created_at >= oneHourAgo && item.created_at <= currentTime
      );
      const previousTwoHoursData = data.filter(
        (item) =>
          item.created_at >= twoHoursAgo && item.created_at <= currentTime
      );
      if (!data.length) {
        return res
          .status(404)
          .json({ error: "Winner is not declare yet try after some time" });
      }
      if (!previousOneHourData) {
        console.log(data);
        return res
          .status(404)
          .json({ error: "No winner data found in perivious one hour" });
      } else if (!previousTwoHoursData) {
        return res
          .status(404)
          .json({ error: "No winner data found in perivious second hour" });
      }
      if (previousOneHourData.length) {
        return res.json({
          message: "Winner data is",
          previousOneHourData,
        });
      } else {
        return res.json({
          message: "Winner data is",
          previousTwoHoursData,
        });
      }
    } catch (error) {
      console.error("Failed to place bid:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
  const winner = async () => {
  try {
    // Retrieve all users from the user table
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      where: {
        isDeleted: false,
      },
    });

    if (users.length === 0) {
      console.log("No users found");
    }
    // Generate a random index using crypto module
    const randomBytes = crypto.randomBytes(4);
    const randomIndex = randomBytes.readUInt32BE(0) % users.length;
    const winner = users[randomIndex];

    console.log("winner is ", winner);

    const winnerRepository = AppDataSource.getRepository(Winner);
    const data = winnerRepository.create({
      userId: winner.userId,
      winnerName: winner.userName,
      created_at: moment().utc().toDate(),
    });
    await AppDataSource.getRepository(Winner).save(data);
  } catch (err) {
    console.error("Failed to declare winner", err);
  }
  };
export const job = cron.schedule("0 * * * *", () => {
  console.log("crone called at ", new Date().toDateString());
  winner();
});
export default CardController;
