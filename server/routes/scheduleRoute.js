
import express from "express";
import mongoose from "mongoose";
import Schedule from "../models/Schedule.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

// GET all schedule entries
router.get("/", async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.user.id })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch planner entries",
    });
  }
});

// CREATE a schedule entry
router.post("/", async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, status } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      !date ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, date, start time and end time are required",
      });
    }

    const schedule = await Schedule.create({
      userId: req.user.id,
      title: title.trim(),
      description,
      date,
      startTime,
      endTime,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Planner entry created successfully",
      schedule,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid planner data. Check the date and time values.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create planner entry",
    });
  }
});

// UPDATE a schedule entry
router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid planner entry ID",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "date",
      "startTime",
      "endTime",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (typeof updates.title === "string") {
      updates.title = updates.title.trim();
    }

    const schedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Planner entry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Planner entry updated successfully",
      schedule,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid planner data",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update planner entry",
    });
  }
});

// DELETE a schedule entry
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid planner entry ID",
      });
    }

    const schedule = await Schedule.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Planner entry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Planner entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete planner entry",
    });
  }
});

export default router;
