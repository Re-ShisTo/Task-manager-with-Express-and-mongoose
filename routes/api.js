import express from "express";
const router = express.Router()
import * as authController from "../app/controllers/authController.js"
import * as taskController from "../app/controllers/taskController.js"
import authMiddleware from "../app/middlewares/authMiddleware.js"

// Auth Public Routes
router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/verify-email", authController.verifyEmail)
router.post("/verify-otp", authController.verifyOtp)
router.post("/reset-password", authController.resetPassword)

//Auth Protected Routes
router.get("/profile", authMiddleware, authController.getProfile)
router.get("/tasks/:user_Id", authMiddleware, taskController.getTask)
router.post("/tasks", authMiddleware, taskController.createTask)
router.put("/tasks/:task_id", authMiddleware, taskController.updateTask)
router.delete("/tasks/:task_id", authMiddleware, taskController.deleteTask)

export default router
