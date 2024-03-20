/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = knex =>
  knex.schema.createTable('entity_libraries_updates', table => {
    table.increments('id').primary();
    table
      .integer('library_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('libraries')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
    table.string('library_name', 255);
    table.enum('type_of_update', ['breaking', 'minor', 'patch', 'unknown']);
    table.string('update_date', 255);
    table.string('entity_id', 255);
    table.string('library_path', 255);
    table.string('language', 255);
    table.string('current_entity_version', 255);
    table.string('registry_version', 255);
    table.unique(['library_id', 'current_entity_version', 'library_path']);
  });

  /**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
  exports.down = knex => knex.schema.dropTable('entity_libraries_updates');