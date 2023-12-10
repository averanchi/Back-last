import PostModel from "../models/Post.js";
import CommentModel from "../models/Comment.js";

export const getLasTags = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Tags couldn't be taken",
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "The article couldn't be created",
    });
  }
};

export const getAllNew = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .populate("user")
      .exec();

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "The articles were not found",
    });
  }
};

export const getAllPopular = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ viewsCount: -1 })
      .populate("user")
      .exec();

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "The articles were not found",
    });
  }
};

export const getAllByTags = async (req, res) => {
  try {
    const tag = req.params.tag;
    console.log(tag, typeof tag);
    const posts = await PostModel.find({ tags: tag }).populate("user").exec();

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "The articles were not found",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;
    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: "after",
      }
    )
      .populate("user")
      .then((doc) => {
        if (!doc) {
          return res.status(404).json({
            message: "Needed post was not found",
            error: err,
          });
        }
        res.json(doc);
      })
      .catch((err) => {
        if (err) {
          return res.status(403).json({
            message: "Post was not found",
            error: err,
          });
        }
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "The articles were not found",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    PostModel.findOneAndDelete({
      _id: postId,
    })
      .then((doc) => {
        if (!doc) {
          return res.status(404).json({
            message: "Needed post was not found",
          });
        }
        res.json({
          success: true,
        });
      })
      .catch((err) => {
        if (err) {
          return res.status(500).json({
            message: "Post was not delete",
          });
        }
      });
  } catch (err) {
    console.log(err);
    res.status(403).json({
      message: "The articles were not found",
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags,
        user: req.userId,
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "The post couldn't be updated",
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;
    const userId = req.userId;

    const comment = new CommentModel({
      text,
      user: userId,
      post: postId,
    });

    await comment.save();

    const postNew = await PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      { $inc: { commentsCount: 1 } },
      { new: true }
    );

    res.status(201).json({
      message: "Comment added successfully",
      postNew,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await CommentModel.find({ post: postId });

    if (comments.length > 0) {
      await CommentModel.populate(comments, {
        path: "user",
        select: "fullName avatarUrl",
      });
    }

    res.status(200).json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getLastComments = async (req, res) => {
  try {
    const latestComments = await CommentModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user post")
      .exec();

    res.status(200).json(latestComments);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

getLastComments;
