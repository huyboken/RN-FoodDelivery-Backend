const { mongoConfig } = require("../config");
const MongoDB = require("./mongodb.service");

const getUserData = async (username) => {
    try {
        let userObject = await MongoDB.db
            .collection(mongoConfig.collections.USERS)
            .findOne({ username });
        if (userObject) {
            return {
                status: true,
                message: "Người dùng được tìm thấy thành công",
                data: userObject,
            };
        } else {
            return {
                status: false,
                message: "Người dùng không được tìm thấy",
            };
        }
    } catch (error) {
        return {
            status: false,
            message: "Tìm kiếm người dùng không thành công",
            error: `Tìm kiếm người dùng không thành công : ${error.message}`,
        };
    }
};

module.exports = { getUserData }