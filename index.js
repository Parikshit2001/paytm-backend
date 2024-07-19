const express = require("express");
const cors = require("cors");
const rootRouter = require("./routes/index");

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({
    message: "Route Reachable in branch"
  })
})

app.use("/api/v1", rootRouter);

app.listen(3000, () => {
  console.log("Listening on PORT 3000");
});
