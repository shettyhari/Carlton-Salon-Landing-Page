// Creates the leads table. Works on SQLite, MySQL and PostgreSQL.
// Runs automatically when the backend starts (AUTO_MIGRATE=true) or with `npm run migrate`.

exports.up = async function (knex) {
  await knex.schema.createTable("leads", (t) => {
    t.increments("id").primary();
    t.string("name", 120).notNullable();
    t.string("phone", 20).notNullable();
    t.string("email", 160).notNullable();
    t.string("city", 120);
    t.string("capital_contribution", 60);
    t.string("timeline", 60);
    t.string("background", 80);
    t.string("source", 120);
    t.string("page", 500);
    t.string("ip_address", 64);
    t.string("user_agent", 300);
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    t.index(["created_at"]);
    t.index(["email"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("leads");
};
