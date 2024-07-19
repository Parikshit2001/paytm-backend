const express = require("express");
const { User, Account } = require("../db");
const mongoose = require("mongoose");
const { authMiddlware } = require("../middleware");

const router = express.Router();

router.get("/balance", authMiddlware, async (req, res) => {
  const account = await Account.findOne({
    userId: req.userId,
  });

  return res.json({
    balance: account.balance,
  });
});

router.post("/transfer", authMiddlware, async (req, res) => {
  console.log('HI')
  const session = await mongoose.startSession();
  session.startTransaction();

  const { amount, to } = req.body;

  const fromAccount = User.findOne({
    userId: req.userId,
  });

  if (!fromAccount) {
    return res.status(400).json({
      message: "Unable to find payer Account",
    });
  } else if (fromAccount.balance < amount) {
    return res.status(400).json({
      message: "Insufficient balance",
    });
  }

  const toAccount = User.findOne({
    userId: to,
  });

  if (!toAccount) {
    return res.status(400).json({
      message: "Invalid recepient account",
    });
  }

  // Perform the transaction
  await Account.updateOne(
    { userId: req.userId },
    { $inc: { balance: -amount } }
  ).session(session);
  await Account.updateOne(
    { userId: to },
    { $inc: { balance: amount } }
  ).session(session);

  // Commit the transaction
  session.commitTransaction();

  return res.json({
    message: 'Transaction Successful'
  })
});

module.exports = router;
