const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const userRoute = require("./routes/User");
app.use("/user", userRoute);
const postsRoute = require("./routes/Posts");
app.use("/posts", postsRoute);

app.get("/", (req, res) => {
    res.send("Nothing is here!")
});

app.listen(process.env.PORT || 3001, (req, res) => {
    console.log(`Server running on port ${process.env.PORT || 3001}`);
});