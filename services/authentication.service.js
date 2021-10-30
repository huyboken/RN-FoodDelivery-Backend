const MongoDB = require("./mongodb.service")
const { mongoConfig, tokenSecret } = require("../config")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userRegister = async (user) => {
    try {
        if (!user?.username || !user?.email || !user?.password)
            return { status: false, message: "Vui lòng điền vào tất cả các trường" };
        const passwordHash = await bcrypt.hash(user?.password, 10)
        let userObject = {
            username: user?.username,
            email: user?.email,
            password: passwordHash
        }
        let savedUser = await MongoDB.db
            .collection(mongoConfig.collections.USERS)
            .insertOne(userObject)
        if (savedUser?.acknowledged && savedUser?.insertedId) {
            let token = jwt.sign(
                { username: userObject?.username, email: userObject?.email },
                tokenSecret,
                { expiresIn: '24h' })
            return {
                status: true,
                message: "Người dùng đã đăng ký thành công",
                data: token
            };
        }
        else {
            return {
                status: false,
                message: "Người dùng đã đăng ký thất bại",
            };
        }
    } catch (error) {
        console.log(error);
        let errorMessage = "Người dùng đã đăng ký thất bại"
        error?.code === 11000 && error?.keyPattern?.username
            ? (errorMessage = "Vui lòng cung cấp tên đăng nhập của bạn")
            : null;
        error?.code === 11000 && error?.keyPattern?.email
            ? (errorMessage = "Vui lòng cung cấp email của bạn")
            : null;
        return {
            status: false,
            message: errorMessage,
            error: error?.toString()
        };
    }
}
const userLogin = async (user) => {
    try {
        if (!user?.username || !user?.password)
            return { status: false, message: "Vui lòng điền vào tất cả các trường" };
        let userObject = await MongoDB.db
            .collection(mongoConfig.collections.USERS)
            .findOne({ username: user?.username })
        if (userObject) {
            let isPasswordveryfied = await bcrypt.compare(user?.password, userObject?.password)
            if (isPasswordveryfied) {
                let token = jwt.sign(
                    { username: userObject?.username, email: userObject?.email },
                    tokenSecret,
                    { expiresIn: '24h' })
                return {
                    status: true,
                    message: "Người dùng đã đăng nhập thành công",
                    data: token
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
            error: error?.toString()
        };
    }
};

const checkUserExist = async (query) => {
    let messages = {
        email: "Email đã tồn tại",
        username: "Tên đăng nhập này đã được sử dụng"
    }
    try {
        let queryType = Object.keys(query)[0];
        let userObject = await MongoDB.db
            .collection(mongoConfig.collections.USERS)
            .findOne(query); 
        return !userObject
            ? { status: true, message: `Tên ${queryType} này chưa được sử dụng` }
            : { status: false, message: messages[queryType] }
    } catch (error) {

    }
}

module.exports = { userRegister, userLogin, checkUserExist };