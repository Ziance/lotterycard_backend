import { Request, Response, response } from "express";
import AppDataSource from "../ormconfig";
import { Credit } from "../entity/Credit";
import { Bid } from "../entity/Bid";
import moment from "moment";
import Template from "../response/index";
import { User } from "../entity/User";
import cron from "node-cron";
import { Winner } from "../entity/winner";
import { Session } from "../entity/Session";
import { UserBidHistory } from "../entity/userBidHistory";
import { winningCard } from "../entity/winningCard";
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
      const query = await AppDataSource.query(
        "SELECT * FROM lautry.session ORDER BY sessionEndTime DESC LIMIT 1"
      );
      if (query.length === 0) {
        console.log("Bidding are close.");
        return;
      }
      const status = query[0];

      const query2 = await AppDataSource.query(
        "SELECT * FROM session ORDER BY sessionEndTime DESC LIMIT 1"
      );
      if (query2.length === 0) {
        // console.log("No session found in the database.");
        return;
      }
      const session = query2[0];
      console.log(session.seesionId);
      // console.log("session id :", sessionId);

      if (!data) {
        return res.status(401).json(Template.userNotFound());
      }

      if (data.credits < 1) {
        return res.status(403).json({ error: "Insufficient credits" });
      }
      if (status.allowBid === 1) {
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
          createbid.bidCard = req.body.card;
          createbid.sessionId = session.seesionId;
          await AppDataSource.getRepository(Bid).save(createbid);
        }
        return res.json({
          message: "Bid placed successfully",
          newCredit: data.credits,
        });
      } else {
        console.log("Bidding are closed");
        return res.json({
          message: "Bidding are closed",
        });
      }
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
  public static createUserBidHistory = async (req: Request, res: Response) => {
    const { userId, bidCard, date } = req.body;
    console.log("req", date);

    try {
      const winCard = await AppDataSource.getRepository(Winner);
      const winResponse = await winCard.find({
        where: {
          created_at: date,
          // userId:userId
        },
      });
      console.log("winresponse ===========>", winResponse);
      const response = await AppDataSource.getRepository(UserBidHistory).create(
        {
          userId: userId,
          bidCard: bidCard,
          date: date,
          bidStatus: winResponse.length > 0 ? true : false,
        }
      );
      const results = await AppDataSource.getRepository(UserBidHistory).save(
        response
      );
      if (results) {
        res.status(200).json({ message: "bid is added in bid history table" });
      } else {
        res.json({ message: "bid is not added" });
      }
    } catch (error) {
      console.error(error);
    }

    // if (!user) {
    //   return res.status(400).json({ error: "User parameter is missing" });
    // }

    // try {
    //   const existingUser = AppDataSource.getRepository(Credit);
    //   const data = await existingUser.findOne({
    //     where: {
    //       userId: user,
    //     },
    //   });

    //   if (!data) {
    //     return res.status(401).json(Template.userNotFound());
    //   }

    //   if (data.credits < 1) {
    //     return res.status(403).json({ error: "Insufficient credits" });
    //   }

    //   data.credits -= 1;
    //   await AppDataSource.getRepository(Credit).save(data);

    //   const addbidrecord = await AppDataSource.getRepository(Bid);
    //   const bidData = await addbidrecord.findOne({
    //     where: {
    //       userId: user,
    //     },
    //   });
    //   if (bidData) {
    //     const storedDate = moment(bidData.date).utc();
    //     const inputDate = moment().utc();
    //     if (
    //       bidData &&
    //       storedDate.isBefore(inputDate) &&
    //       bidData.userId == user

    //     ) {
    //       return res.json({
    //         message: "You have alredy placed the bid wait for the results",
    //       });
    //     }
    //     bidData.userId = user;
    //     bidData.date = moment().utc().toDate();
    //     await AppDataSource.getRepository(Bid).save(bidData);
    //   } else {
    //     const createbid = await AppDataSource.getRepository(Bid).create();
    //     createbid.userId = user;
    //     createbid.date = moment().utc().toDate();
    //     await AppDataSource.getRepository(Bid).save(createbid);
    //   }
    //   return res.json({
    //     message: "Bid placed successfully",
    //     newCredit: data.credits,
    //   });
    // } catch (error) {
    //   console.error("Failed to place bid:", error);
    //   return res.status(500).json({ error: "Internal server error" });
    // }
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
      res.json({ message: "error occured" });
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
    // console.log("Latest bid card:", latestBidCard);

    const query1 = await AppDataSource.query(
      "SELECT * FROM winning_card ORDER BY created_at DESC LIMIT 1"
    );
    if (query1.length === 0) {
      console.log("No winner card found in the database.");
      return;
    }
    const winCard = query1[0];
    // console.log("Latest winning card:", winCard.winnerCard);

    const query2 = await AppDataSource.query(
      "SELECT * FROM session ORDER BY sessionEndTime DESC LIMIT 1"
    );
    if (query2.length === 0) {
      // console.log("No session found in the database.");
      return;
    }
    const sessionId = query2[0];
    // console.log("session id :", sessionId);

    const query3 = await AppDataSource.query(
      `SELECT * FROM lautry.bid where bidCard = '${winCard.winnerCard}'`
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
          "SELECT * FROM lautry.session ORDER BY sessionEndTime DESC LIMIT 1"
        );
        console.log(query);
        const sessionId = query[0];
        const query1 = await AppDataSource.query(
          `update session set allowBid = 0  where id = ${sessionId.id}`
        );
        const update = query1[0];
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          let sessionid = Math.floor(Math.random() * 100);

          const session = await AppDataSource.getRepository(Session).create({
            sessionStartTime: startTime,
            sessionEndTime: endTime,
            allowBid: true,
            seesionId: sessionid,
          });
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
  const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
  const values = [
    "Ace",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "Jack",
    "Queen",
    "King",
  ];

  const randomSuit = suits[Math.floor(Math.random() * suits.length)];
  const randomValue = values[Math.floor(Math.random() * values.length)];

  return `${randomValue} of ${randomSuit}`;
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
    // Set up the cron job 0 for one hour
    // cron.schedule('* * * * *', async () => {
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
    await AppDataSource.getRepository(Session).save(session);
    console.log("Session data saved:", session);
    // });

    console.log("Session data storage initialized.");
  } catch (error) {
    console.log("An error occurred:", error);
  }
}

// export const job = cron.schedule("* * * * *", () => {
//   console.log("crone called at ", new Date().toUTCString());
//   // winnningCard();
//   storeSessionData();
//   checkAndStoreWinner();
// });

export const cronjob = cron.schedule("0 * * * *", () => {
  console.log("crone called at ", new Date().toUTCString());
  winnningCard();
  storeSessionData();
  checkAndStoreWinner();
});
export default CardController;

// const scheduleCronJob = async () =>  {
//   console.log("session 1 =>",Session);
//   console.log("winner 1 =>",Winner);
//   try {

//     const sessionRepo = AppDataSource.getRepository(Session);
//     const sessions = await sessionRepo.find({
//       order: {
//         sessionEndTime: "DESC",
//       },
//       take: 1,
//     });

//     if (sessions.length > 0) {
//       const sessionEndTime = sessions[0].sessionEndTime;

//       const cronTime = new Date(sessionEndTime);
//       cronTime.setHours(cronTime.getHours() + 1);
//       cronTime.setSeconds(0); // Set seconds to 0

//       cron.schedule(
//         "0 " + cronTime.getMinutes() + " " + cronTime.getHours() + " * * *",
//         async () => {
//           try {

//             // Retrieve session details from the database
//             const sessionDetails = await sessionRepo.find({
//               order: {
//                 sessionEndTime: "DESC",
//               },
//               take: 1,
//             });

//             if (sessionDetails.length > 0) {
//               const { sessionStartTime, seesionId } = sessionDetails[0];
//               const sessionRepo = AppDataSource.getRepository(Session);
//               const data = sessionRepo.create({
//                 sessionStartTime: sessionStartTime,
//                 sessionEndTime: sessionEndTime,
//                 seesionId: seesionId,
//               });

//               await AppDataSource.getRepository(Session).save(data);
//               console.log("Session details stored successfully.");
//             } else {
//               console.error("No session details found.");
//             }
//           } catch (error) {
//             console.error("Error:", error.message);
//           }
//         }
//       );
//     } else {
//       throw new Error("No session end time found.");
//     }
//   } catch (error) {
//     console.log(error);
//     console.error("Error++++++++++++:", error.message);
//   }
// }

// scheduleCronJob();
