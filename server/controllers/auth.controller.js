const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userService = require("../services/user.service");
const { RoleEnum } = require("../utils/enum");

// Add helper functions for token generation
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

const authController = {
  loginWithGoogle: async (req, res) => {
    try {
      const { accessToken } = req.body;
      OAuth2Client.setCredentials({
        access_token: accessToken,
      });
      const oAuth2 = google.oauth2({
        auth: OAuth2Client,
        version: "v2",
      });
      const { data } = await oAuth2.userinfo.get();

      if (data) {
        const { verified_email, email, name, picture, id } = data;
        if (verified_email) {
          const user = await userService.getByServiceId(id);

          if (user) {
            const { fullName, email, avatar, phoneNumber, role, _id } = user;
            const token = generateAccessToken({ userId: _id, role });
            const refreshToken = generateRefreshToken(_id);
            res.cookie("refreshToken", refreshToken, {
              httpOnly: true,
              secure: false,
              maxAge: 1000 * 60 * 60 * 24 * 7,
            });
            return res.status(200).json({
              token,
              user: { fullName, email, avatar, phoneNumber, userId: _id, role },
            });
          } else {
            const newUser = await userService.create({
              email,
              fullName: name,
              avatar: { url: picture },
              service: "Google",
              serviceId: id,
              status: 1,
            });
            const token = generateAccessToken({
              userId: newUser?._id,
              role: 0,
            });
            const refreshToken = generateRefreshToken({
              userId: newUser?._id,
              role: 0,
            });
            res.cookie("refreshToken", refreshToken, {
              httpOnly: true,
              secure: false,
              maxAge: 1000 * 60 * 60 * 24 * 7,
            });
            return res.status(200).json({
              token,
              user: newUser,
            });
          }
        }
      }

      return res.status(500).json({
        message: "Error",
        error: 1,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  loginWithFacebook: async (req, res) => {
    try {
      const { email, name, avatar, id } = req.body;
      const user = await userService.getByServiceId(id);
      if (user) {
        const { fullName, email, avatar, role, _id } = user;
        const token = generateAccessToken({ userId: _id, role });
        const refreshToken = generateRefreshToken(_id);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        return res.status(200).json({
          token,
          user: { fullName, email, avatar, userId: _id, role },
        });
      } else {
        const newUser = await userService.create({
          email,
          fullName: name,
          avatar: { url: avatar },
          service: "Facebook",
          serviceId: id,
          status: 1,
        });
        const token = generateAccessToken({ userId: newUser?._id, role: 0 });
        const refreshToken = generateRefreshToken({
          userId: newUser?._id,
          role: 0,
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        return res.status(200).json({
          token,
          user: newUser,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  register: async (req, res) => {
    try {
      const { email, fullName, password } = req.body;

      const checkEmail = await userService.getByEmail(email);
      if (checkEmail)
        return res.status(400).json({ message: "Email đã tồn tại!", error: 1 });

      const hashPassword = await bcrypt.hash(password, 10);

      const result = await userService.register({
        email,
        fullName,
        password: hashPassword,
        status: 1, // Set status to active by default since we're removing email verification
      });

      const { password: pw, ...data } = result;
      res.status(201).json({
        message: "Đăng ký tài khoản thành công",
        error: 0,
        data: data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  loginBookStore: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await userService.getByEmailRegister(email);

      if (!user)
        return res
          .status(400)
          .json({ error: 1, message: "Tài khoản, mật khẩu không đúng!" });

      const {
        password: passwordDB,
        status,
        fullName,
        phoneNumber,
        avatar,
        role,
        _id,
      } = user;

      const checkPassword = await bcrypt.compare(password, passwordDB);
      if (!checkPassword)
        return res
          .status(400)
          .json({ error: 1, message: "Tài khoản, mật khẩu không đúng!" });

      // Remove email verification check
      if (status === 0 && role === 2)
        return res
          .status(400)
          .json({ error: 3, message: "Tài khoản của bạn đã bị khóa!" });

      const token = generateAccessToken({ userId: _id, role });
      const refreshToken = generateRefreshToken(_id);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      return res.status(200).json({
        token,
        user: { fullName, phoneNumber, email, avatar, userId: _id, role },
      });
    } catch (error) {
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  handleForgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await userService.getByEmailRegister(email);

      if (!user) {
        return res.status(400).json({
          message: "Tài khoản không tồn tại!",
          error: 1,
        });
      }
      const tokenReset = generateAccessToken({ userId: user._id });
      const host = req.get("origin");
      const link = `${host}/dat-lai-mat-khau/${tokenReset}`;
      const resultSendMail = await transporter.sendMail({
        from: '"BOOKSTORE" <project.php.nhncomputer@gmail.com>',
        to: email,
        subject: `[BOOKSTORE] Hãy đặt lại mật khẩu tài khoản của bạn`,
        html: ` <h2>Xin chào bạn ${user.fullName},</h2>
                        <p>Chúng tôi biết rằng bạn đã mất mật khẩu BookStore của mình.</p>
                        <p>
                            Nhưng đừng lo lắng, bạn có thể truy cập link sau để đặt lại mật khẩu của mình:
                        </p>
                        <a href="${link}"><h3>Đặt lại mật khẩu</h3></a>
                        <p>Trân trọng,</p>
                        <p><b>BOOKSTORE</b></p>`,
      });
      return res.status(200).json({
        error: 0,
        message: "success",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  handleResetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;

      jwt.verify(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET,
        async (err, data) => {
          if (err)
            return res
              .status(400)
              .json({ error: 1, message: "Token không hợp lệ!" });
          const { userId } = data;
          const user = await userService.getById(userId);
          if (user) {
            const hashPassword = await bcrypt.hash(password, 10);
            const result = await userService.handleResetPassword(userId, {
              password: hashPassword,
            });
            return res.status(200).json({
              error: 0,
              message: "success",
              result,
            });
          }
        }
      );
    } catch (error) {
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  getCurrentUser: async (req, res) => {
    try {
      const { user } = req;
      const { userId } = user;
      const data = await userService.getById(userId);
      return res.status(200).json({
        user: data,
        message: "success",
      });
    } catch (error) {
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
 /* handleRefreshToken: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken)
        return res.status(401).json({ message: "401 Unauthorized" });
      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET,
        async (err, data) => {
          if (err) return res.status(403).json({ message: "403 Forbidden" });
          const { userId } = data;
          const { role } = await userService.getById(userId);
          const newToken = generateAccessToken({ userId, role });
          const newRefreshToken = generateRefreshToken(userId);
          res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 * 7,
          });
          return res.status(200).json({
            token: newToken,
          });
        }
      );
    } catch (error) {
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },*/
  handleRefreshToken: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "401 Unauthorized" });
      }
  
      // Verify the refresh token
      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET,
        async (err, data) => {
          if (err) {
            return res.status(403).json({ message: "403 Forbidden" });
          }
  
          const { userId } = data;
  
          // Fetch user by ID
          const user = await userService.getById(userId);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
  
          const { role } = user;
  
          // Generate new access token and refresh token
          const newToken = generateAccessToken({ userId, role });
          const newRefreshToken = generateRefreshToken(userId);
  
          // Set the new refresh token in cookies
          res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,  // Set to true in production with HTTPS
            maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 days
          });
  
          return res.status(200).json({
            token: newToken,
          });
        }
      );
    } catch (error) {
      console.error("Error in refresh token handler:", error);
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  handleLogout: async (req, res) => {
    try {
      res.clearCookie("refreshToken");
      return res.status(200).json({ message: "Logout sucesss", error: 0 });
    } catch (error) {
      res.status(500).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await userService.getByEmail(email);

      if (!user) {
        return res.status(400).json({
          message: "Email không tồn tại!",
          error: 1,
        });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({
          message: "Mật khẩu không đúng!",
          error: 1,
        });
      }

      const accessToken = generateAccessToken({ id: user._id });
      const refreshToken = generateRefreshToken(user._id);

      res.status(200).json({
        message: "success",
        error: 0,
        data: {
          accessToken,
          refreshToken,
          user,
        },
      });
    } catch (error) {
      res.status(400).json({
        message: `Có lỗi xảy ra! ${error.message}`,
        error: 1,
      });
    }
  },
};

module.exports = authController;
