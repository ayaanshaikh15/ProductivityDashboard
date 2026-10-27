
import express from "express";
import Task from "../models/Task.js";
import Goal from "../models/Goals.js";
import Schedule from "../models/Schedule.js";
import authMiddleware from "../middleware/auth.js";
import mongoose from "mongoose";
const router = express.Router();

router.use(authMiddleware);

// Get the UTC start of today
const getTodayRange = () => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
};

// GET dashboard summary
router.get("/summary", async (req, res) => {
  try {
    const userId = req.user.id;
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const { start, end } = getTodayRange();

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      totalGoals,
      completedGoals,
      goalProgress,
      todaySchedules,
      todayTasks,
      recentTasks,
    ] = await Promise.all([
      Task.countDocuments({ userId }),

      Task.countDocuments({
        userId,
        status: "Completed",
      }),

      Task.countDocuments({
        userId,
        status: "Pending",
      }),

      Task.countDocuments({
        userId,
        status: "In Progress",
      }),

      Goal.countDocuments({ userId }),

      Goal.countDocuments({
        userId,
        status: "Completed",
      }),

      Goal.aggregate([
        { $match: { userId: objectUserId } },
        {
          $group: {
            _id: null,
            averageProgress: { $avg: "$progress" },
          },
        },
      ]),

      Schedule.find({
        userId,
        date: { $gte: start, $lt: end },
      }).sort({ startTime: 1 }),

      Task.find({
        userId,
        dueDate: { $gte: start, $lt: end },
      }).sort({ dueDate: 1 }),

      Task.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("title status priority dueDate updatedAt"),
    ]);

    const taskCompletionRate = totalTasks
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    const averageGoalProgress = goalProgress.length
      ? Math.round(goalProgress[0].averageProgress || 0)
      : 0;

    res.status(200).json({
      success: true,
      summary: {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completionRate: taskCompletionRate,
          dueToday: todayTasks.length,
        },
        goals: {
          total: totalGoals,
          completed: completedGoals,
          averageProgress: averageGoalProgress,
        },
        planner: {
          totalToday: todaySchedules.length,
          completedToday: todaySchedules.filter(
            (item) => item.status === "Completed"
          ).length,
        },
      },
      todayTasks,
      todaySchedules,
      recentTasks,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary",
    });
  }
});

// GET productivity analytics
router.get("/analytics", async (req, res) => {
  try {
    const userId = req.user.id;

    // Include today and the six preceding UTC calendar days
    const { end } = getTodayRange();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 7);

    const [
      taskDistribution,
      completedPerDay,
      createdPerDay,
      totalTasks,
      completedTasks,
      totalGoals,
      completedGoals,
    ] = await Promise.all([
      Task.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Task.aggregate([
        {
          $match: {
            userId: userId,
            status: "Completed",
            updatedAt: { $gte: start, $lt: end },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$updatedAt",
                timezone: "UTC",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),

      Task.aggregate([
        {
          $match: {
            userId: userId,
            createdAt: { $gte: start, $lt: end },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),

      Task.countDocuments({ userId }),

      Task.countDocuments({
        userId,
        status: "Completed",
      }),

      Goal.countDocuments({ userId }),

      Goal.countDocuments({
        userId,
        status: "Completed",
      }),
    ]);

    // Include dates with zero activity
    const dailyActivity = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + i);

      const dateKey = day.toISOString().slice(0, 10);

      const completed = completedPerDay.find(
        (item) => item._id === dateKey
      );

      const created = createdPerDay.find(
        (item) => item._id === dateKey
      );

      dailyActivity.push({
        date: dateKey,
        completedTasks: completed?.count || 0,
        createdTasks: created?.count || 0,
      });
    }

    const statusDistribution = [
      { status: "Completed", count: 0 },
      { status: "Pending", count: 0 },
      { status: "In Progress", count: 0 },
    ].map((item) => {
      const found = taskDistribution.find(
        (entry) => entry._id === item.status
      );

      return {
        ...item,
        count: found?.count || 0,
      };
    });

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalTasks,
          completedTasks,
          taskCompletionRate: totalTasks
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0,
          totalGoals,
          completedGoals,
          goalCompletionRate: totalGoals
            ? Math.round((completedGoals / totalGoals) * 100)
            : 0,
        },
        dailyActivity,
        statusDistribution,
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to load productivity analytics",
    });
  }
});

export default router;
