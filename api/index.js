require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const salt = bcrypt.genSaltSync(10);
const cookieParser = require("cookie-parser");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const bucket = "vish-blog-app";
const multer = require("multer");
const fs = require("fs");
const uploadMiddleware = multer({ dest: "/tmp" });

const PORT = process.env.PORT || 4000;
const secret = process.env.SECRET;
const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.get("/api", (req, res) => {
  res.json("test ok");
});

async function uploadToS3(path, originalname, mimetype) {
  const client = new S3Client({
    region: "ap-south-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newFilename = Date.now() + "." + ext;
  const data = await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Body: fs.readFileSync(path),
      Key: newFilename,
      ContentType: mimetype,
      ACL: "public-read",
    })
  );
  return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
}

mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));

app.post("/api/register", async (req, res) => {
  mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({ username, password: bcrypt.hashSync(password, salt) });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});
app.post("/api/login", async (req, res) => {
  mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  if (!userDoc) {
    res.status(400).json("wrong credentials");
    return;
  }
  const passok = bcrypt.compareSync(password, userDoc.password);
  if (passok) {
    // logged in
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) {
        throw err;
      }
      res.cookie("token", token).json({
        id: userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json("wrong credentials");
  }
});

app.post("/api/logout", (req, res) => {
  mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));
  res.cookie("token", "").json("ok");
});

app.get("/api/profile", (req, res) => {
  mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      throw err;
    }
    res.json(info);
  });
  res.json(req.cookies);
});

// app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
//   const { originalname, path } = req.file;
//   const parts = originalname.split(".");
//   const ext = parts[parts.length - 1];
//   const newPath = path + "." + ext;
//   fs.renameSync(path, newPath);
//   const { token } = req.cookies;
//   const { title, summary, content } = req.body;
//   jwt.verify(token, secret, {}, async (err, info) => {
//     if (err) {
//       throw err;
//     }
//     try {
//       const postDoc = await Post.create({
//         title,
//         summary,
//         content,
//         cover: newPath,
//         author: info.id,
//       });
//       res.json(postDoc);
//     } catch (e) {
//       console.log(e);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });
// });

app.post("/api/post", uploadMiddleware.single("file"), async (req, res) => {
  mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));
  const { originalname, path, mimetype } = req.file;
  const url = await uploadToS3(path, originalname, mimetype);
  const { token } = req.cookies;
  const { title, summary, content } = req.body;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      throw err;
    }
    try {
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: url,
        author: info.id,
      });
      res.json(postDoc);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});

// app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
//   let newPath = null;
//   if (req.file) {
//     const { originalname, path } = req.file;
//     const parts = originalname.split(".");
//     const ext = parts[parts.length - 1];
//     newPath = path + "." + ext;
//     fs.renameSync(path, newPath);
//   }
//   const { token } = req.cookies;
//   jwt.verify(token, secret, {}, async (err, info) => {
//     if (err) {
//       throw err;
//     }
//     const { id, title, summary, content } = req.body;
//     const postDoc = await Post.findById(id);
//     const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
//     if (!isAuthor) {
//       return res.status(400).json("you are not the author");
//     }
//     await postDoc.updateOne({
//       title,
//       summary,
//       content,
//       cover: newPath ? newPath : postDoc.cover,
//     });
//     res.json(postDoc);
//   });
// });

app.put("/api/post", uploadMiddleware.single("file"), async (req, res) => {
  mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));
  let newPath = null;
  if (req.file) {
    const { originalname, path, mimetype } = req.file;
    newPath = await uploadToS3(path, originalname, mimetype);
  }
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      throw err;
    }
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json("you are not the author");
    }
    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });
    res.json(postDoc);
  });
});

app.get("/api/post", async (req, res) => {
  mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));
  res.json(await Post.find().populate("author", ["username"]).sort({ createdAt: -1 }).limit(20));
});
app.get("/api/post/:id", async (req, res) => {
  mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});
app.get("/api/delete/post/:id", async (req, res) => {
  mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

app.delete("/api/post/:id", async (req, res) => {
  mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      throw err;
    }
    const postId = req.params.id;
    const postDoc = await Post.findById(postId);
    if (!postDoc) {
      return res.status(404).json("Post not found");
    }
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res
        .status(400)
        .json("You are not the author of this post, You are not authorized to delete it");
    }
    await postDoc.deleteOne();
    res.json(postDoc);
  });
});

app.listen(PORT, function () {
  console.log(`Server started on Port ${PORT}`);
});
