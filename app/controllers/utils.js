const getAll = (model, callback) => {
  model.find({}, function(err, results) {
    var resultsMap = {};

    results.forEach(function(results) {
      resultsMap[results._id] = results;
    });

    callback(resultsMap);
  });
};

module.exports = {
  getAll,
}
