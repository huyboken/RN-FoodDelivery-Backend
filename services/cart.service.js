const { mongoConfig } = require("../config");
const MongoDB = require("./mongodb.service");

const addToCart = async ({ foodId, username }) => {
    try {
        let updatedCart = await MongoDB.db
            .collection(mongoConfig.collections.CARTS)
            .updateOne(
                { foodId, username },
                { $inc: { count: 1 } },
                { upsert: true }
            );
        if (updatedCart?.modifiedCount > 0 || updatedCart?.upsertedCount > 0) {
            return {
                status: true,
                message: "Thêm vào giỏ hàng thành công",
            };
        }
    } catch (error) {
        return {
            status: false,
            message: "Thêm vào giỏ hàng không thành công",
        };
    }
};

const removeToCart = async ({ foodId, username }) => {
    try {
        let updatedCart = await MongoDB.db
            .collection(mongoConfig.collections.CARTS)
            .updateOne(
                { foodId, username },
                { $inc: { count: -1 } },
                { upsert: true }
            );
        if (updatedCart?.modifiedCount > 0 || updatedCart?.upsertedCount > 0) {
            return {
                status: true,
                message: "Xoá mặt hàng khỏi giỏ hàng thành công",
            };
        }
    } catch (error) {
        return {
            status: false,
            message: "Xoá mặt hàng khỏi giỏ hàng không thành công",
        };
    }
};

const getCartItems = async ({ username }) => {
    try {
        let cartItems = await MongoDB.db
            .collection(mongoConfig.collections.CARTS)
            .aggregate([
                {
                    $match: {
                        username: username,
                    },
                },
                {
                    $lookup: {
                        from: "foods",
                        localField: "foodId",
                        foreignField: "id",
                        as: "food",
                    },
                },
                {
                    $unwind: {
                        path: "$food",
                    },
                },
            ])
            .toArray();
        if (cartItems?.length > 0) {
            return {
                status: true,
                message: "Tìm các mặt hàng trong giỏ hàng thành công",
                data: {
                    cartItems,
                    metaData: {
                        itemsTotal: 0,
                        discount: 0,
                        grandTotal: 0,
                    },
                },
            };
        }
    } catch (error) {
        return {
            status: false,
            message: "Tìm các mặt hàng trong giỏ hàng không thành công",
        };
    }
};

module.exports = { addToCart, removeToCart, getCartItems };
