
exports.seed = function(db) {
  return db("brand_categories").truncate()
    .then(async function () {

      // Grows as more sample data is added
      const mappings = {
        restaurant: ["kfc", "mcd"],
        fast_food: ["kfc", "mcd"],
        supermarket: ["nfp"]
      };

      let results = [];

      // Finds ID of each brand and the category it falls under,
      // then adds the mapping to the `brand_categories` table 
      await db.transaction(async trx => {
        for (cat in mappings) {
          const brands = mappings[cat];
          for (let i=0; i<brands.length; i++) {
            const brandId = await db("brands")
              .where("ShortName", brands[i])
              .select("BrandId")
              .transacting(trx);
            const catId = await db("categories")
              .where("CodeName", cat)
              .select("CategoryId")
              .transacting(trx);
            results.push({BrandId: brandId[0]["BrandId"], CategoryId: catId[0]["CategoryId"]});
          }
        }
      });
      return db("brand_categories").insert(results);
    });
};
