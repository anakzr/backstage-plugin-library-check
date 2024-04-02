/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex =>
  await knex.schema.table('entity_libraries_updates', table => {
    table.dropUnique(['library_id', 'current_entity_version', 'library_path']);
    table.unique(['library_name', 'current_entity_version', 'library_path']);
    table.dropColumn('library_id');
  });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async knex => {
  await knex.schema.table('entity_libraries_updates', table => {
    table.string('library_name', 255);
    table.enum('type_of_update', ['breaking', 'minor', 'patch', 'unknown']);
    table.string('update_date', 255);
    table.string('entity_id', 255);
    table.string('library_path', 255);
    table.string('language', 255);
    table.string('current_entity_version', 255);
    table.string('registry_version', 255);
    table.unique(['library_name', 'current_entity_version', 'library_path']);
  });
};
