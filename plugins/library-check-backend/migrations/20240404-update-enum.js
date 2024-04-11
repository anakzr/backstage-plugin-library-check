/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex => {
  await knex.schema.raw(`
      ALTER TABLE "entity_libraries_updates"
      DROP CONSTRAINT IF EXISTS "entity_libraries_updates_type_of_update_check";
      
      ALTER TABLE "entity_libraries_updates"
      ADD CONSTRAINT "entity_libraries_updates_type_of_update_check" 
      CHECK ("type_of_update" = ANY (ARRAY['breaking'::text, 'minor'::text, 'patch'::text, 'unknown'::text, 'up-to-date'::text]));
      `);
};

exports.down = async knex => {
  await knex.schema.raw(`
    ALTER TABLE "entity_libraries_updates"
    DROP CONSTRAINT IF EXISTS "entity_libraries_updates_type_of_update_check";
    
    ALTER TABLE "entity_libraries_updates"
    ADD CONSTRAINT "entity_libraries_updates_type_of_update_check" 
    CHECK ("type_of_update" = ANY (ARRAY['breaking'::text, 'minor'::text, 'patch'::text, 'unknown'::text]));
      `);
};
