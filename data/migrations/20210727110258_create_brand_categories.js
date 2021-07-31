
exports.up = function(knex) {
    return knex.schema
    .createTable("brand_categories", table => {
        table.integer("BrandId").unsigned();
        table.integer("CategoryId").unsigned();
        table.index(["BrandId", "CategoryId"]);
    });
};

exports.down = function(knex) {
    return knex.schema
	.dropTable("brand_categories");
};
