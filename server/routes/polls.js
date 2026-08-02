const express = require("express");
const router = express.Router();
const Poll = require("../models/Polls.js");

//GET /api/polls - get all polls, new first
router.get("/", async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({
      message: "Server error while getting",
      error: error.message,
    });
  }
});

//POST /api/polls - create a new polls
router.post("/", async (req, res) => {
  try {
    const { question, options } = req.body;
    if (!question || !options || options.length < 2 || options.length > 6) {
      return res.status(400).json({
        message: "Question and at least 2 options required",
      });
    }
    const formattedOptions = options.map((opt) => ({
      text: typeof opt === "string" ? opt : opt.text,
      votes: 0,
    }));
    const polls = new Poll({ question, options: formattedOptions });
    await polls.save();
    res.status(201).json(polls);
  } catch (error) {
    res.status(500).json({
      message: "Server error while creating",
      error: error.message,
    });
  }
});

//GET /api/polls/:id - get a single poll by id
router.get("/:id", async (req, res) => {
  try {
    const polls = await Poll.findById(req.params.id);
    if (!polls) {
      return res.status(404).json({
        message: "Poll not found by Id",
      });
    }
    res.json(polls);
  } catch (error) {
    res.status(500).json({
      message: "Server error while getting a single poll",
      error: error.message,
    });
  }
});

//POST  /api/polls/:id - submit vote
router.post("/:id/vote", async (req, res) => {
  try {
    const { optionsIndex } = req.body;
    const polls = await Poll.findById(req.params.id);
    if (!polls)
      return res.status(404).json({
        message: "Poll not found by Id",
      });

    if (optionsIndex < 0 || optionsIndex >= polls.options.length)
      return res.status(400).json({
        message: "Invalid Option ",
      });

    polls.options[optionsIndex].votes += 1;
    polls.totalVotes += 1;
    await polls.save();
    res.json(polls);
  } catch (error) {
    res.status(500).json({
      message: "Server error while voting",
      error: error.message,
    });
  }
});

module.exports = router;
