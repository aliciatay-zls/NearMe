
exports.seed = function(db) {
  return db("brand_categories").truncate()
    .then(function () {
      return db("brand_categories").insert([
        {BrandId: 1, CategoryId: 1},
        {BrandId: 1, CategoryId: 2},
        {BrandId: 2, CategoryId: 1},
        {BrandId: 2, CategoryId: 2}
      ]);
    });
};
