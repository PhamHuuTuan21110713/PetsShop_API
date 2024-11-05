import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateAccessToken = async (payload) => {
  const access_token = jwt.sign(
    {
      ...payload,
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: "15m" }
  );
  return access_token;
};

const generateRefreshToken = async (payload) => {
  const refresh_token = jwt.sign(
    {
      ...payload,
    },
    process.env.REFRESH_TOKEN,
    { expiresIn: "1d" }
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

const checkToken = (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  let token = null
  if(authorizationHeader) {
    token = authorizationHeader.split(' ')[1];
  }
  try {
    jwt.verify(token,process.env.ACCESS_TOKEN,  (err, user) => {
      if(err) {
        console.log("ko hople: ", err);
        res.status(401).json({
          status: "ERR",
          message: "Token không hợp lệ",
        })
      } else {
        console.log(" hople")
        res.status(200).json({
          status: "SUCCESS",
          message: "Token hợp lệ",
          data: user,
        })
      }
    } )
  } catch(err) {
    res.status(401).json({
      status: "ERR",
      message: "Token không hợp lệ",
    })
  }
}

const JWTService = {
  generateAccessToken,
  generateRefreshToken,
  refreshTokenService,
  generateResetPasswordToken,
  checkToken
};


export default JWTService 