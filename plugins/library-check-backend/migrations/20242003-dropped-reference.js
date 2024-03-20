/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex =>
  await knex.schema.table('entity_libraries_updates', table => {
    table.dropColumn('library_id')
  });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => knex.schema.dropTable('entity_libraries_updates');
