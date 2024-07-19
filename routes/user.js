const express = require("express");
const { User, Account } = require("../db");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddlware } = require("../middleware");

const router = express.Router();

const signupBody = zod.object({
  username: zod.string(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});
router.post("/signup", async (req, res) => {
  const { success } = signupBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Invalid request body",
    });
  }

  const body = req.body;

  const existingUser = await User.findOne({
    username: body.username,
  });
  if (existingUser) {
    return res.status(411).json({
      message: "Username already taken",
    });
  }

  const user = await User.create({
    username: body.username,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
  });
  const userId = user._id;

  await Account.create({
    userId,
    balance: Math.floor(1 + Math.random() * 10000),
  });

  const token = await jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );

  res.json({
    message: "User created successfully",
    token,
  });
});

const signinBody = zod.object({
  username: zod.string(),
  password: zod.string(),
});
router.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Invalid request body",
    });
  }

  const body = req.body;

  const user = await User.findOne({
    username: body.username,
    password: body.password
  });
  if (!user) {
    return res.status(411).json({
      message: "No such user exists in our Database",
    });
  }

  const token = jwt.sign(
    {
      userId: user._id,
    },
    JWT_SECRET
  );

  return res.json({
    token,
  });
});

const updateBody = zod.object({
  firstName: zod.string().min(1, {message: 'This field cannot be empty'}).optional(),
  lastName: zod.string().min(1, {message: 'This field cannot be empty'}).optional(),
  password: zod.string().min(6, {message: 'Password should be at least 6 characters'}).optional()
});
router.put("/", authMiddlware, async (req, res) => {
  try {
    updateBody.parse(req.body)
  } catch (error) {
    return res.status(411).json({
      message: "Invalid request body",
      Error: error
    });
  }

  await User.updateOne({
    _id: req.userId,
  }, req.body);

  res.json({
    message: "Updated Successfully",
  });
});

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || ''

  const users = await User.find({
    $or: [{
      firstName: {
        '$regex': filter,
        '$options': 'i'
      }
    }, {
      lastName: {
        '$regex': filter,
        '$options': 'i'
      }
    }, {
      username: {
        '$regex': filter,
        '$options': 'i'
      }
    }]
  })

  res.json({
    user: users.map(user => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id
    }))
  })
});

module.exports = router;