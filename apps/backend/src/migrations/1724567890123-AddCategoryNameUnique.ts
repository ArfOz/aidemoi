import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddCategoryNameUnique1724567890123 implements MigrationInterface {
  name = 'AddCategoryNameUnique1724567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'category',
      new TableColumn({
        name: 'name',
        type: 'varchar',
        length: '255',
        isNullable: false,
      })
    );

    await queryRunner.createIndex(
      'category',
      new TableIndex({
        name: 'UQ_category_name',
        columnNames: ['name'],
        isUnique: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('category', 'UQ_category_name');
    await queryRunner.dropColumn('category', 'name');
  }
}
