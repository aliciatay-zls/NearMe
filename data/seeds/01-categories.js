
exports.seed = function(db) {
  return db("categories").truncate()
  .then(function () {
    return db("categories").insert([
      {CategoryName: "Restaurant", CodeName: "restaurant"},
      {CategoryName: "Fast Food", CodeName: "fast_food"},
      {CategoryName: "Supermarket", CodeName: "supermarket"}
    ]);
  });
};
