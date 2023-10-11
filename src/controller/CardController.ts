import { Request, Response } from "express";
import AppDataSource from "../ormconfig";
import { Bid } from "../entity/Bid";
import moment from "moment";
import Template from "../response/index";
import { User } from "../entity/User";
import cron from "node-cron";
import { Winner } from "../entity/winner";
import { Session } from "../entity/Session";
import { UserBidHistory } from "../entity/userBidHistory";
import { winningCard } from "../entity/winningCard";
import { Cards } from "../entity/Cards";
class CardController {
  public static placebid = async (req: Request, res: Response) => {
    const user = req.params.userId;
    if (!user) {
      return res.status(400).json({ error: "User parameter is missing" });
    }
    console.log("parameter missing");

    try {
      const existingUser = AppDataSource.getRepository(User);
      const userData = await existingUser.findOne({
        where: {
          userId: user,
        },
      });

      console.log("existing user...", existingUser);


      if (!userData) {
        return res.status(401).json(Template.userNotFound());
      }

      const sessionCheck = await AppDataSource.query(
        "SELECT * FROM session ORDER BY sessionEndTime DESC LIMIT 1"
      );

      console.log("userDatavvvvvvvvvvvvvv", userData);
      console.log("sessionCheckvvvvvvvv", sessionCheck);


      if (
        sessionCheck.length === 0 ||
        (sessionCheck.length && sessionCheck[0].allowBid === 0)
      ) {
        return res.status(401).json({
          message: "bidding are close",
        });
      }

      console.log("sessionCheck.length...", sessionCheck.length);


      if (userData.credits === 0) {
        return res.status(403).json({ error: "Insufficient credits" });
      }
      console.log("userData1111", userData);


      const addbidrecord = AppDataSource.getRepository(Bid);
      console.log("addbidrecordaddbidrecord", addbidrecord);


      const bidData = await addbidrecord.findOne({
        where: {
          userId: user,
          sessionId: sessionCheck[0].sessionId,
        },
      });

      console.log("bidData22222222", bidData);

      if (bidData) {
        return res.status(409).json({
          message: "You have alredy placed the bid wait for the results",
        });
      }

      const createbid = await AppDataSource.getRepository(Bid).create();
      console.log("CREATED BID response", createbid);

      createbid.userId = user;
      createbid.date = moment().utc().toDate();
      createbid.bidCard = req.body.card;
      createbid.sessionId = sessionCheck[0].sessionId;
      await AppDataSource.getRepository(Bid).save(createbid);

      userData.credits -= 1;
      await AppDataSource.getRepository(User).save(userData);

      const bidHistory = await AppDataSource.getRepository(
        UserBidHistory
      ).create({
        userId: user,
        sessionId: sessionCheck[0].sessionId,
        bidCard: req.body.card,
        date: new Date()
      });
      console.log("bidHistory", bidHistory);

      await AppDataSource.getRepository(UserBidHistory).save(bidHistory);
      console.log("ended");

      return res.status(200).json({
        message: "Bid placed successfully",
        newCredit: userData.credits,
      });
    } catch (error) {
      console.error("Failed to place bid:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  public static addMoreCredits = async (req: Request, res: Response) => {
    const userid = req.params.userId;

    if (!userid) {
      return res.status(400).json({ error: "User parameter is missing" });
    }
    try {
      const creditdata = AppDataSource.getRepository(User);
      const data = await creditdata.findOne({
        where: {
          userId: userid,
        },
      });

      let existingCredit = data?.credits;

      const creditsRepository = await AppDataSource.getRepository(User)
        .createQueryBuilder()
        .update({ credits: existingCredit + Number(53) })
        .where("userId = :userId", { userId: userid })
        .execute();

      if (creditsRepository) {
        return res.status(200).json({ message: "53 credits are added" });
      } else {
        return res.status(400).json({ message: "credits are not added" });
      }
    } catch (error) {
      console.error("Failed to add credit:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  public static changeCards = async (req: Request, res: Response) => {
    const userid = req.params.userId;
    if (!userid) {
      return res.status(400).json({ error: "User parameter is missing" });
    }
    try {
      const creditdata = AppDataSource.getRepository(User);
      const data = await creditdata.findOne({
        where: {
          userId: userid,
        },
      });
      if (!data) {
        return res.status(404).json({
          message: "User not found please check",
        });
      }
      const query = `update bid set bidCard = '${req.body.Card}' where userId = '${data.userId}'`;
      const queryResult = await AppDataSource.query(query);
      if (queryResult.length === 0) {
        console.log("No bid card found in the database.");
        return;
      }
      return res.status(200).json({
        message: "Card Updated Successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server eroor",
        error: error,
      });
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
      if (!data.length) {
        return res.status(404).json({
          error:
            "Winner is not declare yet try after some time or No winner found",
        });
      }
      return res.status(200).json({
        message: "Winner data is",
        data,
      });
    } catch (error) {
      console.error("Failed to place bid:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };




  public static getWinnersCardList = async (req: Request, res: Response) => {
    try {
      const winnerRepository = AppDataSource.getRepository(winningCard);
      const data = await winnerRepository.find();

      return res.status(200).json({
        message: "Winner Cards list",
        data,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };



  public static getUserBidHistory = async (req: Request, res: Response) => {
    const { userId } = req.params;

    const myQuery = `SELECT ub.id,ub.date,ub.bidCard,wc.winnerCard FROM user_bid_history ub LEFT JOIN winning_card wc ON ub.sessionId = wc.sessionId WHERE ub.userId = ${userId}`
    const response = await AppDataSource.query(myQuery);

    if (response.length) {
      res.status(200).json({ history: response });
    } else {
      res.json({ message: "no data available" });
    }
  };

  public static getallcards = async (req: Request, res: Response) => {
    try {
      const cards = AppDataSource.getRepository(Cards);
      const data = await cards.find();
      return res.status(200).json({ message: "data is ", data: data });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    }
  };

  public static manuallySessionCalledTest = async (
    req: Request,
    res: Response
  ) => {
    try {
      const sessionRepository = AppDataSource.getRepository(Session);
      const winnerRepository = AppDataSource.getRepository(winningCard);

      const sessionData = await sessionRepository.find();
      // console.log("sessionData : ", sessionData);

      if (sessionData.length === 0) {
        console.log("session is not available...");
        return;
      }

      const winnerData = await winnerRepository.save(
        winnerRepository.create({
          winnerCard: await getRandomCard(),
          sessionId: sessionData[0].sessionId,
          created_at: moment().utc().toDate(),
        })
      );
      // console.log("Winning card is Saved ", winnerData);

      const startTime = new Date();
      // const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 60);

      const sessionId = Math.floor(Math.random() * 100);

      const createdSession = await sessionRepository.save(
        sessionRepository.create({
          sessionStartTime: startTime,
          sessionEndTime: endTime,
          allowBid: true,
          sessionId: sessionId,
        })
      );
      console.log("createdSession ", createdSession);

      const bidQuery = `SELECT * FROM bid ORDER BY date DESC LIMIT 1`;
      const bidResult = await AppDataSource.query(bidQuery);
      if (bidResult.length === 0) {
        console.log("No bid card found in the database.");
        return;
      }

      const winningCardQuery = `SELECT * FROM winning_card ORDER BY created_at DESC LIMIT 1`
      const winningResult = await AppDataSource.query(winningCardQuery);
      if (winningResult.length === 0) {
        console.log(`No winner card found in the database.`);
        return;
      }

      const sessionQuery = `SELECT * FROM session ORDER BY sessionEndTime DESC LIMIT 1`
      const sessionResult = await AppDataSource.query(sessionQuery);
      if (sessionResult.length === 0) {
        console.log(`No session found in the database.`);
        return;
      }

      const latestBidCard = bidResult[0];
      console.log("Latest bid card:", latestBidCard);

      const currrentWinningCard = winningResult[0];
      console.log("currrentWinningCard : ", currrentWinningCard)

      const currentSessionData = sessionResult[0];
      console.log("currentSessionData : ", currentSessionData)

      // this is pending

      return res.status(200).json({ message: "manually session check...." });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  };
}

function getRandomCard(): string {
  const suits = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"];
  const values = [
    "ACE",
    "TWO",
    "THREE",
    "FOUR",
    "FIVE",
    "SIX",
    "SEVEN",
    "EIGHT",
    "NINE",
    "TEN",
    "JACK",
    "QUEEN",
    "KING",
  ];

  const randomSuit = suits[Math.floor(Math.random() * suits.length)];
  const randomValue = values[Math.floor(Math.random() * values.length)];

  return "ACE_OF_CLUBS";
  return `${randomValue}_OF_${randomSuit}`;
}

async function commonSessionManage(): Promise<void> {
  try {
    // check session is active or not 
    const sessionData = await AppDataSource.query(`SELECT * FROM session ORDER BY sessionEndTime DESC LIMIT 1`);
    if (sessionData.length === 0) {
      console.log("no sessiong is available and return")
      return
    }

    const totalBids = await AppDataSource.query(`SELECT * FROM bid WHERE sessionId = ${sessionData[0].sessionId}`);
    if (totalBids.length === 0) {
      console.log("No bid card found in the database.");
      return;
    }

    const randomWinningCard = await getRandomCard()
    const winnerUserData = await totalBids.find((item) => item.bidCard === randomWinningCard)
  
    // insert winner to db
    const winnerRepository = AppDataSource.getRepository(winningCard);
    const data = winnerRepository.create({
      winnerCard: randomWinningCard,
      sessionId: sessionData[0].sessionId,
      created_at: moment().utc().toDate(),
    });

    const newWinnerCard = await AppDataSource.getRepository(winningCard).save(
      data
    );

    if (winnerUserData) {
      const newWinner = AppDataSource.getRepository(Winner).create({
        userId: winnerUserData.userId,
        winnerBidCard: randomWinningCard,
        created_at: moment().utc().toDate(),
        sessionId: sessionData[0].sessionId
      });
      
      await AppDataSource.getRepository(Winner).save(
        newWinner
      );
    }

    const updateSessionQuery = `update session set allowBid = 0  where sessionId = ${sessionData[0].sessionId}`;
    await AppDataSource.query(updateSessionQuery);

    // create new session
    const newSession = AppDataSource.getRepository(Session).create({
      sessionStartTime: new Date(),
      sessionEndTime: new Date(new Date().getTime() + 60 * 60 * 1000),
      allowBid: true,
      sessionId: Math.floor(Math.random() * 100)
    });

    await AppDataSource.getRepository(Session).save(newSession);
  } catch (err) {
    console.error("Failed to declare winner", err);
  }
}

export const cronjob = cron.schedule("*/1 * * * *", async () => {
  console.log("cronjob called")
  console.log("crone called at new ", new Date().toUTCString());
  await commonSessionManage()
});

export default CardController;
