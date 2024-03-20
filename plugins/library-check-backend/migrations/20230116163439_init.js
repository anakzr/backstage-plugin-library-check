/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex =>
  knex.schema.createTable('libraries', table => {
    table.increments('id').primary().unique();
    table.string('name', 150).notNullable();
    table.string('language', 255).notNullable();
    table.string('description', 640000);
    table.string('registry_last_check', 255);
    table.string('modified_at', 255);
    table.string('latest_version', 120);
    table.string('next_version', 120);
    table.string('latest_version_date', 255);
    table.string('created_at', 255);
    table.string('repository', 255);
    table.string('homepage_url', 255);
    table.string('bugs_url', 255);
    table.string('engines', 255);
    table.unique(['name', 'language']);
  });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => knex.schema.dropTable('libraries');

