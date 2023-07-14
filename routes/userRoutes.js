import express from 'express';
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';

const router = express.Router();

// route level middlewares - to protect Routes
router.use("/changePassword" , checkUserAuth);
router.use("/loggedUser",checkUserAuth);

// public routes - do not need authentication
router.post("/registration", UserController.userRegistration);
router.get("/login" , UserController.userLogin);
router.post("/send-reset-password-email", UserController.sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token",UserController.userPasswordReset);

// protected Routed
router.post("/changePassword" ,UserController.changeUserPassword);
router.get("/loggedUser", UserController.loggedUser);

export default router



