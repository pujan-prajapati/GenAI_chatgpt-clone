import express from "express";
import "dotenv/config";
import cors from "cors";
import generateRoute from "./routes/generate.js";

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", generateRoute);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
