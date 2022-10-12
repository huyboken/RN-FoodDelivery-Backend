const express = require("express");
const { addToCart, removeToCart, getCartItems } = require("../services/cart.service");
const router = express.Router();

router.get("/", async (req, res) => {
    let username = req?.username
    let response = await getCartItems({ username });
    res.json(response)
})

router.post("/:foodId", async (req, res) => {
    let { foodId } = req?.params
    let username = req?.username
    let response = await addToCart({ foodId, username });
    res.json(response)
})

router.delete("/:foodId", async (req, res) => {
    let { foodId } = req?.params
    let username = req?.username
    let response = await removeToCart({ foodId, username });
    res.json(response)
})

module.exports = router;