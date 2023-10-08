/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
	pgm.createTable("albums", {
		id: {
			type: "VARCHAR(16)",
			primaryKey: true,
		},
		name: {
			type: "TEXT",
			notNull: true,
			unique: true,
		},
		year: {
			type: "INTEGER",
			notNull: true,
		},
		created_at: {
			type: "TIMESTAMP",
			notNull: true,
		},
		updated_at: {
			type: "TIMESTAMP",
			notNull: true,
		},
	});
};

exports.down = (pgm) => {
	pgm.dropTable("albums");
};
