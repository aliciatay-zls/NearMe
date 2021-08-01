
exports.up = function(knex) {
  return knex.schema
  .createTable("outlets", table => {
    table.increments("OutletId"); //equiv to setting pri key + int unsigned not null auto_increment
    table.string("OutletName", 100).notNullable();
    table.float("Latitude", 8, 5).notNullable();
    table.float("Longitude", 8, 5).notNullable();
    table.string("Postal", 6).notNullable();
    table.string("Contact", 8).notNullable();
    table.string("Closing", 255).notNullable();
    table.integer("BrandId").unsigned(); //these two lines equiv to setting BrandId as foreign key
    table.foreign("BrandId").references("Brands.BrandId");
  })
};

exports.down = function(knex) {
  return knex.schema
  .dropTable("outlets");
};
