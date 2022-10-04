const MongoDB = require("./mongodb.service");
const { mongoConfig, tokenSecret } = require("../config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");

const userRegister = async (user) => {
    try {
        if (!user?.username || !user?.email || !user?.password)
            return { status: false, message: "Vui lòng điền vào tất cả các trường" };
        const passwordHash = await bcrypt.hash(user?.password, 10);
        let userObject = {
            username: user?.username,
            email: user?.email,
            password: passwordHash,
        };
        let savedUser = await MongoDB.db
            .collection(mongoConfig.collections.USERS)
            .insertOne(userObject);
        if (savedUser?.acknowledged && savedUser?.insertedId) {
            let token = jwt.sign(
                { username: userObject?.username, email: userObject?.email },
                tokenSecret,
                { expiresIn: "24h" }
            );
            return {
                status: true,
                message: "Người dùng đã đăng ký thành công",
                data: token,
            };
        } else {
            return {
                status: false,
                message: "Người dùng đã đăng ký thất bại",
            };
        }
    } catch (error) {
        console.log(error);
        let errorMessage = "Người dùng đã đăng ký thất bại";
        error?.code === 11000 && error?.keyPattern?.username
            ? (errorMessage = "Vui lòng cung cấp tên đăng nhập của bạn")
            : null;
        error?.code === 11000 && error?.keyPattern?.email
            ? (errorMessage = "Vui lòng cung cấp email của bạn")
            : null;
        return {
            status: false,
            message: errorMessage,
            error: error?.toString(),
        };
    }
};
const userLogin = async (user) => {
    try {
        if (!user?.username || !user?.password)
            return { status: false, message: "Vui lòng điền vào tất cả các trường" };
        let userObject = await MongoDB.db
            .collection(mongoConfig.collections.USERS)
            .findOne({ username: user?.username });
        if (userObject) {
            let isPasswordveryfied = await bcrypt.compare(
                user?.password,
                userObject?.password
            );
            if (isPasswordveryfied) {
                let token = jwt.sign(
                    { username: userObject?.username, email: userObject?.email },
                    tokenSecret,
                    { expiresIn: "24h" }
                );
                return {
                    status: true,
                    message: "Người dùng đã đăng nhập thành công",
                    data: token,
                };
            } else {
                return {
                    status: false,
                    message: "Mật khẩu không đúng",
                };
            }
        } else {
            return {
                status: false,
                message: "Không tìm thấy người dùng",
            };
        }
    } catch (error) {
        console.log(error);
        return {
            status: false,
            message: "Người dùng đăng nhập không thành công",
            error: error?.toString(),
        };
    }
};

const checkUserExist = async (query) => {
    let messages = {
        email: "Email đã tồn tại",
        username: "Tên đăng nhập này đã được sử dụng",
    };
    try {
        let queryType = Object.keys(query)[0];
        let userObject = await MongoDB.db
            .collection(mongoConfig.collections.USERS)
            .findOne(query);
        return !userObject
            ? { status: true, message: `Tên ${queryType} này chưa được sử dụng` }
            : { status: false, message: messages[queryType] };
    } catch (error) { }
};

const tokenVerification = async (req, res, next) => {
    console.log(`authentication | tokenVerification | ${req?.originalUrl}`);
    try {
        if (
            req?.originalUrl.includes("/login") ||
            req?.originalUrl.includes("/user-exist") ||
            req?.originalUrl.includes("/register")
        )
            return next();
        let token = req?.headers["authorization"];
        if (token && token.startsWith("Bearer ")) {
            token = token.slice(7, token?.length);
            jwt.verify(token, config.tokenSecret, (error, decoded) => {
                if (error) {
                    res.status(401).json({
                        status: false,
                        message: error?.name ? error?.name : "Mã không hợp lệ",
                        error: `Mã không hợp lệ | ${error?.message}`,
                    });
                } else {
                    req["username"] = decoded?.username;
                    next();
                }
            });
        } else {
            res.status(401).json({
                status: false,
                message: "Thiếu mã thông báo",
                error: "Thiếu mã thông báo",
            });
        }
    } catch (error) {
        res.status(401).json({
            status: false,
            message: error?.message ? error?.name : "Quá trình xác thực đã thất bại",
            error: `Quá trình xác thực đã thất bại | ${error?.message}`,
        });
    }
};

const tokenRefresh = async (req, res) => {
    console.log(`authentication | tokenRefresh | ${req?.originalUrl}`);
    try {
        let token = req?.headers["authorization"];
        if (token && token.startsWith("Bearer ")) {
            token = token.slice(7, token?.length);
            jwt.verify(token, config.tokenSecret, { ignoreExpiration: true }, async (error, decoded) => {
                if (error) {
                    res.status(401).json({
                        status: false,
                        message: error?.name ? error?.name : "Mã không hợp lệ",
                        error: `Mã không hợp lệ | ${error?.message}`,
                    });
                } else {
                    if (decoded?.username && decoded.email) {
                        let newToken = jwt.sign(
                            { username: decoded?.username, email: decoded?.email },
                            tokenSecret,
                            { expiresIn: "24h" }
                        );
                        res.json({
                            status: true,
                            message: "Làm mới mã thông báo thành công",
                            data: newToken,
                        })
                    } else {
                        res.status(401).json({
                            status: false,
                            message: error?.name ? error?.name : "Mã không hợp lệ",
                            error: `Mã không hợp lệ | ${error?.message}`,
                        });
                    }
                }
            });
        } else {
            res.status(401).json({
                status: false,
                message: error?.name ? error?.name : "Thiếu mã thông báo",
                error: `Thiếu mã thông báo | ${error?.message}`,
            });
        }
    } catch (error) {
        res.status(401).json({
            status: false,
            message: error?.name
                ? error?.name
                : "Làm mới mã thông báo không thành công",
            error: `Làm mới mã thông báo không thành công | ${error?.message}`,
        });
    }
};

module.exports = {
    userRegister,
    userLogin,
    checkUserExist,
    tokenVerification,
    tokenRefresh,
};
