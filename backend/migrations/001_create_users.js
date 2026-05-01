exports.up = pgm => {
    pgm.createTable('users', {
      id: { type: 'serial', primaryKey: true },
      name: { type: 'varchar(255)', notNull: true },
      email: { type: 'varchar(255)', notNull: true, unique: true },
      password: { type: 'varchar(255)', notNull: true },
      created_at: { type: 'timestamp', default: pgm.func('NOW()') },
      updated_at: { type: 'timestamp', default: pgm.func('NOW()') },
    });
  };
  
  exports.down = pgm => pgm.dropTable('users');