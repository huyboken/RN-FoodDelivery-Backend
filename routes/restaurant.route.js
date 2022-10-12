const express = require("express");
const {
    getAllRestaurant,
    getOneRestaurantById,
} = require("../services/restaurant.service");
const router = express.Router();

router.get("/", async (req, res) => {
    let response = await getAllRestaurant();
    res.json(response);
});

router.get("/:restaurantId", async (req, res) => {
    let restauranId = req?.params?.restaurantId;
    let response = await getOneRestaurantById(restauranId);
    res.json(response);
});

module.exports = router;
