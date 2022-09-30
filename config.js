const config = require("./package.json").projectConfig

module.exports = {
    mongoConfig: {
        connectionUrl: config.mongoConnectionUrl,
        database: "FoodDelivery",
        collections: {
            USERS: "users",
        },
    },
    serverConfig: {
        ip: config.serverIp,
        port: config.serverPort,
    },
    tokenSecret: "foodelivery_secret",
};