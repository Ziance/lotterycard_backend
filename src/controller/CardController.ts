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
        (sessionCheck.length && sessionCheck[0].allowBid == 0)
      ) {
        return res.status(401).json({
          message: "bidding are close",
        });
      }



      if (userData.credits === 0) {
        return res.status(403).json({ error: "Insufficient credits" });
      }

      const addbidrecord = AppDataSource.getRepository(Bid);
      console.log("addbidrecordaddbidrecord", addbidrecord);
      

      const bidData = await addbidrecord.findOne({
        
        where: {
          userId: user,
          sessionId: sessionCheck[0].sesionId,
        },
      });





      if (bidData) {
        return res.status(409).json({
          message: "You have alredy placed the bid wait for the results",
        });
      }

      const createbid = await AppDataSource.getRepository(Bid).create();
      createbid.userId = user;
      createbid.date = moment().utc().toDate();
      createbid.bidCard = req.body.card;
      createbid.sessionId = sessionCheck[0].seesionId;
      await AppDataSource.getRepository(Bid).save(createbid);

      userData.credits -= 1;
      await AppDataSource.getRepository(User).save(userData);

      const bidHistory = await AppDataSource.getRepository(
        UserBidHistory
      ).create({ 
        userId: user,
        bidCard: req.body.card,
        date: new Date(),
        bidStatus: false,
      });
      await AppDataSource.getRepository(UserBidHistory).save(bidHistory);
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

    const response = await AppDataSource.getRepository(UserBidHistory);

    const data = await response.find({
      where: {
        userId: userId,
      },
    });
    if (data.length) {
      res.status(200).json({ history: data });
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
      console.log("sessionData : ", sessionData);

      if (sessionData.length === 0) {
        console.log("session is not available...");
        return;
      }

      const winnerData = await winnerRepository.save(
        winnerRepository.create({
          winnerCard: await getRandomCard(),
          sessionId: sessionData[0].seesionId,
          created_at: moment().utc().toDate(),
        })
      );
      console.log("Winning card is Saved ", winnerData);

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      const sessionId = Math.floor(Math.random() * 100);

      const createdSession = await sessionRepository.save(
        sessionRepository.create({
          sessionStartTime: startTime,
          sessionEndTime: endTime,
          allowBid: true,
          seesionId: sessionId,
        })
      );
      console.log("Winning card is Saved ", createdSession);

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
      console.log("currrentWinningCard : " , currrentWinningCard)

      const currentSessionData = sessionResult[0];
      console.log("currentSessionData : " , currentSessionData)

      // this is pending

      return res.status(200).json({ message: "manually session check...." });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  };
}

async function checkAndStoreWinner() {
  try {
    const query = await AppDataSource.query(
      "SELECT * FROM bid ORDER BY date DESC LIMIT 1"
    );
    if (query.length === 0) {
      console.log("No bid card found in the database.");
      return;
    }
    const latestBidCard = query[0];
    console.log("Latest bid card:", latestBidCard);

    const query1 = await AppDataSource.query(
      "SELECT * FROM winning_card ORDER BY created_at DESC LIMIT 1"
    );
    if (query1.length === 0) {
      console.log("No winner card found in the database.");
      return;
    }
    const winCard = query1[0];
    console.log("Latest winning card:", winCard.winnerCard);

    const query2 = await AppDataSource.query(
      "SELECT * FROM session ORDER BY sessionEndTime DESC LIMIT 1"
    );

    if (query2.length === 0) {
      console.log("No session found in the database.");
      return;
    }
    const sessionId = query2[0];
    console.log("session id :", sessionId);

    const query3 = await AppDataSource.query(
      `SELECT * FROM bid where bidCard = '${winCard.winnerCard}'`
    );
    if (query3.length === 0) {
      console.log("no user winning");
      return;
    }
    const userids = query3;
    console.log(userids);

    if (latestBidCard.bidCard === winCard.winnerCard) {
      // Create a new winner
      const newWinner = AppDataSource.getRepository(Winner).create({
        winners: userids.map((item: any) => item.userId).join(","),
        winnerBidCard: latestBidCard.bidCard,
        created_at: moment().utc().toDate(),
        sessionId: sessionId.seesionId,
      });

      // Save the winner to the database
      const savedWinner = await AppDataSource.getRepository(Winner).save(
        newWinner
      );
      if (savedWinner) {
        const query = await AppDataSource.query(
          "SELECT * FROM session ORDER BY date(sessionEndTime) DESC LIMIT 1"
        );
        const sessionId = query[0];
        const query1 = `update session set allowBid = 0  where id = ${sessionId.id}`;
        const result1 = await AppDataSource.query(query1);
        console.log("update query", query1);
        // const update = query1;
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        let sessionid = Math.floor(Math.random() * 100);

        const session = await AppDataSource.getRepository(Session).create();
        (session.sessionStartTime = startTime),
          (session.sessionEndTime = endTime),
          (session.allowBid = true),
          (session.seesionId = sessionid),
          await AppDataSource.getRepository(Session).save(session);
        console.log("Session data saved:", session);

        return;
      }
      console.log("User details stored in the winner table:", savedWinner);
    } else {
      console.log("User did not win.");
    }
  } catch (error) {
    console.log("error is", error);
  }
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

  return `${randomValue}_OF_${randomSuit}`;
}

const winnningCard = async () => {
  try {
    const session = AppDataSource.getRepository(Session);
    const sessionId = await session.find();
    const winnerRepository = AppDataSource.getRepository(winningCard);
    const data = winnerRepository.create({
      winnerCard: getRandomCard(),
      sessionId: sessionId[0].seesionId,
      created_at: moment().utc().toDate(),
    });
    const cardDetail = await AppDataSource.getRepository(winningCard).save(
      data
    );
    console.log("Winning card is Saved ", cardDetail);
  } catch (err) {
    console.error("Failed to declare winner", err);
  }
};

async function storeSessionData(): Promise<void> {
  try {
    console.log("in session ");
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    const allowBid = true;
    let sessionid = Math.floor(Math.random() * 100);

    const session = AppDataSource.getRepository(Session).create({
      sessionStartTime: startTime,
      sessionEndTime: endTime,
      allowBid: allowBid,
      seesionId: sessionid,
    });
    const test = await AppDataSource.getRepository(Session).save(session);
    console.log("Session data saved:", session);
    console.log("done", test);

    console.log("Session data storage initialized.");
  } catch (error) {
    console.log("An error occurred:", error);
  }
}

export const cronjob = cron.schedule("*/1 * * * *", async () => {
  //    console.log("cronjob called")
  //    console.log("crone called at ", new Date().toUTCString());
  //  await winnningCard();
  //  await storeSessionData();
  //   await checkAndStoreWinner();
});

export default CardController;
