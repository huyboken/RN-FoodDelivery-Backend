const { mongoConfig } = require("../config");
const MongoDB = require("./mongodb.service");

const getAllRestaurant = async () => {
    try {
        let restaurants = await MongoDB.db.collection(mongoConfig.collections.RESTAURANTS).find().toArray()
        if (restaurants && restaurants?.length > 0) {
            return {
                status: true,
                message: "Đã tìm thấy nhà hàng thành công",
                data: restaurants
            }
        } else {
            return {
                status: true,
                message: "Không tìm thấy nhà hàng"
            }
        }
    } catch (error) {
        return {
            status: true,
            message: "Tìm nhà hàng không thành công",
            error: `Tìm nhà hàng không thành công | ${error?.message}`,
        }
    }
}

module.exports = { getAllRestaurant }