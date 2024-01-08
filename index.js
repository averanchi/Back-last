import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import { MONGO_URI, PORT } from "./.env.js";

import {
  registerValidator,
  loginValidator,
  postCreateValidator,
} from "./validations.js";

import { UserController, PostController } from "./controllers/index.js";
import { checkAuth, handleValidationErrors } from "./utils/index.js";

// mongoose
//   .connect(
//     "mongodb+srv://1994hromov:Stalin1953@databaseblog.12kgjbe.mongodb.net/blog?retryWrites=true&w=majority"
//   )
//   .then(() => console.log("DB OK"))
//   .catch((err) => console.log("DB Error", err));
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//Login, signing up, info
app.post(
  "/auth/login",
  loginValidator,
  handleValidationErrors,
  UserController.login
);
app.post(
  "/auth/register",
  registerValidator,
  handleValidationErrors,
  UserController.register
);
app.get("/auth/me", checkAuth, UserController.auth);

//Posts, tags
app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.post("/upload/avatar", upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get("/posts/new", PostController.getAllNew);
app.get("/posts/popular", PostController.getAllPopular);

app.get("/tags", PostController.getLasTags);
app.get("/posts/:id", PostController.getOne);
app.get("/posts/bytags/:tag", PostController.getAllByTags);
app.post(
  "/posts",
  checkAuth,
  postCreateValidator,
  handleValidationErrors,
  PostController.create
);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch(
  "/posts/:id",
  postCreateValidator,
  handleValidationErrors,
  PostController.update
);

//Comments
app.post(`/posts/:postId/comments`, checkAuth, PostController.addComment);
app.get(`/posts/:postId/comments`, PostController.getComments);
app.get(`/posts/comments/latest`, PostController.getLastComments);

// app.post("/auth/login", (req, res) => {
//     console.log(req.body)

//     const token = jwt.sign(
//         {
//             email: req.body.email,
//             fullName: "Jenya Gromov",
//         },
//         'secret123'
//     )

//     res.json({
//         success: true,
//         token
//     })
// })

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
