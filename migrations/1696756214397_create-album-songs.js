/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
	pgm.createTable("album_songs", {
		album_id: {
			type: "VARCHAR(16)",
			references: "albums(id)",
			notNull: false,
		},
		song_id: {
			type: "VARCHAR(16)",
			references: "songs(id)",
			notNull: true,
		},
	});
};

exports.down = (pgm) => {
	pgm.dropTable("album_songs");
};
