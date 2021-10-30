const { MongoClient } = require("mongodb");

const { mongoConfig } = require("../config");

class MongoDB {
    static connectToMongoDB = () => {
        MongoClient.connect(mongoConfig.connectionUrl)
            .then((connection) => {
                console.log("Đã kết nối MongoDB");
                this.db = connection.db(mongoConfig.database);
            })
            .catch((error) => console.log(`Kết nối MongoDB thất bại: ${error}`));
    };
}

MongoDB.db = null;

module.exports = MongoDB;