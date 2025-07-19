// Migration to add password column to users table
// Run: npm run migration:generate AddPasswordToUsers
// Then: npm run migration:run

const { TableColumn } = require('typeorm');

class AddPasswordToUsers1720000000001 {
  async up(queryRunner) {
    // Add password column to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'password',
        type: 'varchar',
        length: '255',
        isNullable: true
      })
    );
  }

  async down(queryRunner) {
    // Remove password column from users table
    await queryRunner.dropColumn('users', 'password');
  }
}

module.exports = AddPasswordToUsers1720000000001;
