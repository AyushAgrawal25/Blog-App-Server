const express = require("express");
const mongoose = require("mongoose");
const port = 5000;
const app = express();

mongoose.connect(
  "mongodb://localhost:27017/AppDB",
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  }
);

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDb connected");
});

//middleware
app.use("/uploads", express.static("uploads"));
app.use(express.json());
const userRoute = require("./routes/user");
app.use("/user", userRoute);
const profileRoute = require("./routes/profile");
app.use("/profile", profileRoute);
const blogRoute = require("./routes/blogpost");
app.use("/blogPost", blogRoute);

data = {
  msg: "Welcome to Blog App Backend Server.",
  info: "App Backend created By Ayush Agrawal for Blog App.",
};

app.get('/', (req, res) => {
  res.json(
    data);
});

app.listen(port, "0.0.0.0", () =>
  console.log(`welcome your listinnig at port ${port}`)
);
