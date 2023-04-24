const cors = require("cors");
import express from "express";
import AppDataSource from "./ormconfig";
import { routes as apiRoutes } from "./routes/index";
import bodyParser from "body-parser";

// establish database connection
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

// create and setup express app
const app = express();
app.use(express.json());
app.use(cors({origin: "*"}));
app.use("/", apiRoutes);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// start express server
const PORT = Number(process.env.NODE_DOCKER_PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
