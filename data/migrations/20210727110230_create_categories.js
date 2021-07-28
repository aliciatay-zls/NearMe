
exports.up = function(knex) {
	return knex.schema
	.createTable("categories", table => {
		table.increments("CategoryId");
		table.string("CategoryName", 100).notNullable();
		table.string("CodeName", 100).notNullable();
		table.index(["CodeName"]);
	});
};

exports.down = function(knex) {
  
};
