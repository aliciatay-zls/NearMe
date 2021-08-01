
exports.up = function(knex) {
  return knex.schema
  .createTable("brands", table => {
    table.increments("BrandId");
    table.string("BrandName", 100).notNullable();
    table.string("ShortName", 3).notNullable();
    table.text("Keywords");
    table.index("ShortName");
  })
  .raw("ALTER TABLE brands ADD FULLTEXT(BrandName, Keywords)")
};

exports.down = function(knex) {
  return knex.schema
  .dropTable("brands");
};
