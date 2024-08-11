import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import fileUpload from "express-fileupload"
import dbConnection from "./database/dbConnection.js"
import {errorMiddleware} from './middleware/error.js'
import messageRoute from "./router/messageRoutes.js"
import userRoute from "./router/userRoutes.js"
import timelineRoute from "./router/timelineRoutes.js"
import softwareApplicationRoute  from "./router/softwareAppRoutes.js"
import skillRoute from "./router/skillRoutes.js"
import projectRoute from "./router/projectRoutes.js"

const app = express();
dotenv.config({ path: "./config/config.env" });

//.use is middlware

app.use(
  cors({
    //PROVIDE FRONTEND'S INSIDE ARRAY
    origin: [process.env.PORTFOLIO_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);


app.use("/api/v1/message", messageRoute);
app.use("/api/v1/user", userRoute)
app.use("/api/v1/timeline", timelineRoute)
app.use("/api/v1/softwareapplication", softwareApplicationRoute)
app.use("/api/v1/skill", skillRoute)
app.use("/api/v1/project", projectRoute)


dbConnection();
app.use(errorMiddleware);

export default app;