import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

class UserController {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, tc } = req.body;

    // check if user already exist
    const user = await User.findOne({ email });
    if (user) {
      res.send({ status: "Failed", message: "User already exists" });
    } else {
      if (name && email && password && password_confirmation && tc) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const newUser = new User({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
            });
            await newUser.save();

            const saved_user = await User.findOne({ email: email });
            // genrate token
            const token = jwt.sign(
              { userId: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "20m" }
            );

            res.status(201).json({
              status: "Success",
              message: "Registration Sucessfull.",
              token: token,
            });
          } catch (error) {
            res.send({ status: "Failed", message: "Unable to Register" });
          }
        } else {
          res.send({
            status: "Failed",
            message: "Password and Confirm Password does not match",
          });
        }
      } else {
        res.send({
          status: "Failed",
          message: "Please provide all required fields",
        });
      }
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await User.findOne({ email: email });

        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);

          if (email === user.email && isMatch) {
            const token = jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "50m" }
            );
            res.send({
              status: "Success",
              message: "Login Successfully",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: "Email Or Password is not valid",
            });
          }
        } else {
          res.send({ status: "failed", message: "User not found" });
        }
      } else {
        res.send({
          status: "failed",
          message: "Please provide Email or Password ",
        });
      }
    } catch (error) {
      res.send({ status: "failed", message: "Error in Login" });
    }
  };

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          message: "password and confirm password does not match ",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await User.findByIdAndUpdate(req.user._id, {
          $set: {
            password: newHashPassword,
          },
        });
        res.send({
          "status": "Succes",
          "message": "Password change ",
        });
      }
    } else {
      res.send({
        status: "failed",
        message: "Please provide all required fields ",
      });
    }
  };

  static loggedUser = async (req, res) => {
    res.send({ User: req.user });
  };

  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await User.findOne({ email: email });
      console.log(user);
      const secret = user._id + process.env.JWT_SECRET_KEY;
      if (user) {
        const token = jwt.sign({ userId: user._id }, secret, {
          expiresIn: "15m",
        });
        const link = `http://127.0.0.1:3000/user/reset/${user._id}/${token}`;
        console.log(link);
        let info = await transporter.sendMail({
            from:process.env.EMAIL_FROM,
            to: user.email,
            subject:"Reset Possword",
            html:`<a href=${link}>Click Here</a> to Reset Your Password`
        })
        res.send({
          status: "success",
          message: "Password rest mail sent.... Please check your mail",
        });
      } else {
        res.send({
          status: "failed",
          message: "User not found by this email ",
        });
      }
    }
  };

  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await User.findById(id);
    const newSecret = user._id + process.env.JWT_SECRET_KEY;

    jwt.verify(token, newSecret);

    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          message: "New Password & Confirm New Password does not match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await User.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } })
        res.send({
          status: "Success",
          message: "Password Reset",
        });
      }
    } else {
      res.send({
        status: "failed",
        message: "Please provide all required fields",
      });
    }
  };
}

export default UserController;
