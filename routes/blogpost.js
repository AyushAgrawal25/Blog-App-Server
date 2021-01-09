const express = require("express");
const path = require('path');
const fs = require('fs');
const router = express.Router();
const BlogPost = require("../models/blogpost.model");
const middleware = require("../middleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, req.params.id + ".jpg");
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 6,
  },
});

router
  .route("/add/coverImage/:id")
  .patch(middleware.checkToken, upload.single("img"), (req, res) => {
    BlogPost.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          coverImage: req.file.path,
        },
      },
      { new: true },
      (err, result) => {
        if (err) return res.json(err);
        return res.json(result);
      }
    );
  });
router.route("/Add").post(middleware.checkToken, (req, res) => {
  const blogpost = BlogPost({
    username: req.decoded.username,
    title: req.body.title,
    body: req.body.body,
    categoryId: req.body.categoryId,
  });
  blogpost
    .save()
    .then((result) => {
      res.json({ data: result["_id"] });
    })
    .catch((err) => {
      console.log(err), res.json({ err: err });
    });
});

router.route("/getOwnBlog").get(middleware.checkToken, (req, res) => {
  BlogPost.find({ username: req.decoded.username }, (err, result) => {
    if (err) return res.json(err);
    return res.json({ data: result });
  }).sort({
    time: -1
  });
});

router.route("/getOtherBlog").get(middleware.checkToken, (req, res) => {
  BlogPost.find({ username: { $ne: req.decoded.username } }, (err, result) => {
    if (err) return res.json(err);
    return res.json({ data: result });
  }).sort({
    time: -1
  });
});

router.route("/searchBlogs/:searchText").get(middleware.checkToken, (req, res) => {
  BlogPost.find({
    username: { $ne: req.decoded.username }
  }, (err, result) => {
    if (err) {
      return res.json(err);
    }
    else {
      var searchedBlogs = [];
      for (var i = 0; i < result.length; i++) {
        if (result[i].title) {
          if ((result[i].title.toLowerCase().includes(req.params.searchText.toLowerCase())) || (result[i].body.toLowerCase().includes(req.params.searchText.toLowerCase()))) {
            searchedBlogs.push(result[i]);
          }
        }
      }

      return res.json({
        data: searchedBlogs
      });
    }
  }).sort({
    time: -1
  });
});

router.route("/delete/:id").delete(middleware.checkToken, (req, res) => {
  BlogPost.findOneAndDelete(
    {
      $and: [{ username: req.decoded.username }, { _id: req.params.id }],
    },
    (err, result) => {
      if (err) return res.json(err);
      else if (result) {
        try {
          let imgPath = path.resolve(result.coverImage);
          fs.unlinkSync(imgPath);
          console.log("Deletiong Successful..");
        }
        catch (excp) {
          console.log("Deletion Failed...");
        }
        console.log(result);
        return res.json("Blog deleted");
      }
      return res.json("Blog not deleted");
    }
  );
});

module.exports = router;
