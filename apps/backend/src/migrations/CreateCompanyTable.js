// Migration to create companies table
// Run: npm run migration:generate CreateCompanyTable
// Then: npm run migration:run

const { Table } = require('typeorm');

class CreateCompanyTable1720000000000 {
  async up(queryRunner) {
    // Create companies table
    await queryRunner.createTable(
      new Table({
        name: 'companies',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'website',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'address',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'country',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'postalCode',
            type: 'varchar',
            length: '20',
            isNullable: true
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'active'"
          },
          {
            name: 'employeeCount',
            type: 'int',
            default: 0
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP'
          }
        ]
      })
    );
  }

  async down(queryRunner) {
    // Drop companies table
    await queryRunner.dropTable('companies');
  }
}

module.exports = CreateCompanyTable1720000000000;
