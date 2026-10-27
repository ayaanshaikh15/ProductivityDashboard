
import express from "express";
import mongoose from "mongoose";
import Goal from "../models/Goals.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

// GET all goals
router.get("/", async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      goals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch goals",
    });
  }
});

// CREATE a goal
router.post("/", async (req, res) => {
  try {
    const { title, description, targetDate, progress, status } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Goal title is required",
      });
    }

    const goal = await Goal.create({
      userId: req.user.id,
      title: title.trim(),
      description,
      targetDate: targetDate || null,
      progress,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Goal created successfully",
      goal,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid goal data",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create goal",
    });
  }
});

// UPDATE a goal
router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid goal ID",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "targetDate",
      "progress",
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

    if (updates.targetDate === "") {
      updates.targetDate = null;
    }

    // Keep progress and status consistent
    if (updates.progress === 100 || updates.status === "Completed") {
      updates.progress = 100;
      updates.status = "Completed";
    } else if (
      updates.progress !== undefined ||
      updates.status === "In Progress"
    ) {
      updates.status = "In Progress";
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      goal,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid goal data",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update goal",
    });
  }
});

// DELETE a goal
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid goal ID",
      });
    }

    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete goal",
    });
  }
});

export default router;
