import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillCategoryName1724660000000 implements MigrationInterface {
  name = 'BackfillCategoryName1724660000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Backfill from i18n (prefer 'en', then any), else fallback to id
    await queryRunner.query(`
      UPDATE "categories" c
      SET "name" = COALESCE(
        (
          SELECT ci."name"
          FROM "category_i18n" ci
          WHERE ci."categoryId" = c."id" AND ci."locale" IN ('en', 'fr')
          ORDER BY CASE WHEN ci."locale" = 'en' THEN 0 ELSE 1 END
          LIMIT 1
        ),
        c."id"
      )
    `);

    // 2) Ensure uniqueness by disambiguating duplicates with "-<id>"
    await queryRunner.query(`
      WITH d AS (
        SELECT "name"
        FROM "categories"
        GROUP BY "name"
        HAVING COUNT(*) > 1
      )
      UPDATE "categories" c
      SET "name" = c."name" || '-' || c."id"
      FROM d
      WHERE c."name" = d."name"
    `);

    // 3) Enforce NOT NULL (unique is already handled by the entity)
    await queryRunner.query(`
      ALTER TABLE "categories" ALTER COLUMN "name" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Allow NULLs again (no data loss)
    await queryRunner.query(`
      ALTER TABLE "categories" ALTER COLUMN "name" DROP NOT NULL
    `);
  }
}
