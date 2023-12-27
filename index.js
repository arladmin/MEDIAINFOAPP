const ffprobe = require("ffprobe");
const ffprobeStatic = require("ffprobe-static");
const express = require("express");
const multer = require("multer");
const path = require("path");
const bodyparser = require("body-parser");
const basicAuth = require('express-basic-auth');

const app = express();
app.use(basicAuth({
    users: { admin: process.env.PASSWORD },
    challenge: true // <--- needed to actually show the login dialog!
}));

app.use(express.static(path.join(__dirname + "/uploads")));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSufix = Date.now() + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSufix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/mediainfo", upload.single("file"), (req, res) => {
  ffprobe(req.file.path, { path: ffprobeStatic.path }, (err, info) => {
    if (err) {
      console.log(err);
      res.sendFile(__dirname+"/Error.html")
    } else {
      console.log(info);
      res.json({ info });
    }
  });
});
app.listen(5000, () => {
  console.log("App is listening on port 5000");
});
