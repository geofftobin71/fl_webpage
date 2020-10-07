const { Settings, DateTime } = require("luxon"); 

Settings.defaultZoneName = "Pacific/Auckland";

module.exports = function() {
  return DateTime.local();
};

