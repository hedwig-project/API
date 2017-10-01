const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('../logger');

const DataSchema = new Schema({ type: Schema.Types.Mixed }, { strict : false });
const Data = mongoose.model('Data', DataSchema);

const ConfirmationReportSchema = new Schema({ type: Schema.Types.Mixed }, { strict : false });
const ConfirmationReport = mongoose.model('ConfirmationReport', DataSchema);

const saveData = (message) => {
  Data
    .create(message)
    .then(result => logger.info(`[MongoDB] Saved data: ${result}`))
    .catch(err => logger.error(`[MongoDB] Error when saving data: ${err}`));
}

const saveConfirmationReport = (message) => {
  ConfirmationReport
    .create(message)
    .then(result => logger.info(`[MongoDB] Saved confirmation report: ${result}`))
    .catch(err => logger.error(`[MongoDB] Error when saving confirmation report: ${err}`));
}

module.exports = {
  saveData: saveData,
  saveConfirmationReport: saveConfirmationReport,
};
