const { Settings, DateTime } = require("luxon"); 

Settings.defaultZoneName = "Pacific/Auckland";

const now = DateTime.local(); // .setZone("Pacific/Auckland");

module.exports = {
    "now": now
};

