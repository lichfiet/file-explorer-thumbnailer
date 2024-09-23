const { Sequelize, DataTypes } = require("sequelize");
const logger = require("../middlewares/log.js");

const pgConnector = new Sequelize({
	dialect: "postgres",
	dialectOptions: (process.env.PG_REQURIE_SSL === "true" ? {
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
	} : {}),
	database: process.env.PG_DATABASE,
	username: process.env.PG_USERNAME,
	password: process.env.PG_PASSWORD,
	host: `db`,
	port: process.env.PG_PORT,
	logging: (msg) => logger.debug(`PG Database: ${msg}`),
});

const Item = pgConnector.define("Item", {
	itemName: {
		type: DataTypes.STRING,
		allowNull: false,
	}
});

module.exports = dbController = {
	connect: async () => {
		await pgConnector.authenticate().then(() => {
			logger.info("Connection has been established successfully.");
		}).catch((error) => {
			logger.error("Unable to connect to the database:" + error);
		});
	},
	refreshModels: () => {
		pgConnector.sync().then(() => {
			logger.info("Models have been synced successfully.");
		}).catch((error) => {
			logger.error("Unable to sync models:", error);
		});
	},
	createItem: async (item) => {
		await Item.create(item).then(() => {
			logger.info("Item has been created successfully.");
			return item;
		}).catch((error) => {
			logger.error("Unable to create item:", error);
			throw error;
		});
	},
	getItem: async (itemName) => {
		return await Item.findOne({ where: { itemName } });
	},
	getItems: async () => {
		return await Item.findAll();
	},
	deleteItem: async (itemName) => {
		await Item.destroy({ where: { itemName } }).then(() => {
			logger.info("Item has been deleted successfully.");
		}).catch((error) => {
			logger.error("Unable to delete item:", error);
			throw error;
		});
	},
};
