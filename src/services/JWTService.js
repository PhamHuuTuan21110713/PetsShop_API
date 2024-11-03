import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateAccessToken = async (payload) => {
  const access_token = jwt.sign(
    {
      ...payload,
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: "30s" }
  );
  return access_token;
};

const generateRefreshToken = async (payload) => {
  const refresh_token = jwt.sign(
    {
      ...payload,
    },
    process.env.REFRESH_TOKEN,
    { expiresIn: "365d" }
  );
  return refresh_token;
};

const refreshTokenService = (token) => {
  
  return new Promise((resolve, reject) => {
    try {
      jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
        if (err) {
          reject({
            status: "ERR",
            message: "THE AUTHENTICATION",
          });
        }
        console.log("Refreshing token")
        console.log(user);
        const access_token = await generateAccessToken({
          id: user?.id,
          role: user?.role,
          email: user?.email,
          phone: user?.phone,
        });
        resolve({
          status: "OK",
          message: "REFRESH TOKEN SUCCESS",
          data: access_token,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

const generateResetPasswordToken = async (email) => {
  const currentDate = new Date();
  let randomNumber = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  const reset_token = jwt.sign(
    {
      email,
      key: randomNumber,
      date: currentDate.toISOString(),
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: "10m" }
  );
  return { reset_token, randomNumber };
};

const JWTService = {
  generateAccessToken,
  generateRefreshToken,
  refreshTokenService,
  generateResetPasswordToken,
};


export default JWTService 