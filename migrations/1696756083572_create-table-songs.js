/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
	pgm.createTable("songs", {
		id: {
			type: "VARCHAR(16)",
			primaryKey: true,
		},
		title: {
			type: "TEXT",
			notNull: true,
		},
		year: {
			type: "INTEGER",
			notNull: true,
		},
		genre: {
			type: "VARCHAR",
			notNull: true,
		},
		performer: {
			type: "TEXT",
			notNull: true,
		},
		duration: {
			type: "INTEGER",
			notNull: false,
		},
		album_id: {
			type: "VARCHAR(16)",
			references: "albums(id)",
			notNull: false,
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
	pgm.dropTable("songs");
};
