const express = require("express");
const mongoose = require('mongoose');

const cors = require("cors");
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS"],
  })
);

const mongoConnectionString = `mongodb+srv://kashan123:gok1234@cluster.wcaip.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

const userRoute = require("./routes/User");
app.use("/user", userRoute);
const postsRoute = require("./routes/Posts");
app.use("/posts", postsRoute);

app.get("/", (req, res) => {
  res.send("Nothing is here!");
});

app.listen(process.env.PORT || 3001, (req, res) => {
  mongoose.connect(mongoConnectionString).then(() => {
    console.log("Database is connected")
  }).catch((err) => console.log(error))
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});
