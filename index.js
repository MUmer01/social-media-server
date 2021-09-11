const express = require("express");
// const cors = require("cors");
const app = express();
app.use(express.json());
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS"],
//   })
// );
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const userRoute = require("./routes/User");
app.use("/user", userRoute);
const postsRoute = require("./routes/Posts");
app.use("/posts", postsRoute);

app.get("/", (req, res) => {
  res.send("Nothing is here!");
});

app.listen(process.env.PORT || 3001, (req, res) => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});
