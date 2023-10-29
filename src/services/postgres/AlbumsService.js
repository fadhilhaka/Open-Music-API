const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapAlbumsDBToModel } = require("../../utils");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class AlbumsService {
	constructor() {
		this._pool = new Pool();
	}

	async addAlbum({ name, year }) {
		const id = nanoid(16);
		const createdAt = new Date().toISOString();
		const updatedAt = createdAt;

		const query = {
			text: "INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id",
			values: [id, name, year, createdAt, updatedAt],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new InvariantError(`Gagal menambahkan album: ${name}`);
		}

		return result.rows[0].id;
	}

	async getAlbums() {
		const query = `SELECT * FROM albums`;
		const result = await this._pool.query(query);
		const albums = result.rows.map(mapAlbumsDBToModel);

		return albums;
	}

	async getAlbumById(id) {
		const query = {
			text: `
			  SELECT
				albums.id as album_id,
				albums.name as album_name,
				albums.year as album_year,
				songs.id as song_id,
				songs.title as song_title,
				songs.performer as song_performer
			  FROM
				albums
			  LEFT JOIN
				songs ON albums.id = songs.album_id
			  WHERE
				albums.id = $1
			`,
			values: [id],
		};

		try {
			const result = await this._pool.query(query);

			if (!result.rows.length) {
				throw new NotFoundError("Album tidak ditemukan");
			}

			const albumData = result.rows[0];
			const songs = result.rows
				.filter((row) => row.song_id !== null)
				.map((row) => ({
					id: row.song_id,
					title: row.song_title,
					performer: row.song_performer,
				}));

			const albumWithSongs = {
				id: albumData.album_id,
				name: albumData.album_name,
				year: albumData.album_year,
				songs: songs,
			};

			return albumWithSongs;
		} catch (error) {
			return null; // Return null or an empty object on error
		}
	}

	async editAlbumById(id, { name, year }) {
		const updatedAt = new Date().toISOString();

		const query = {
			text: "UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id",
			values: [name, year, updatedAt, id],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new NotFoundError(
				`Gagal memperbarui album: ${name}. Id tidak ditemukan`
			);
		}
	}

	async deleteAlbumById(id) {
		await this._deleteSongsByAlbumId(id);

		const query = {
			text: "DELETE FROM albums WHERE id = $1 RETURNING id",
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new NotFoundError(`Gagal menghapus album. Id tidak ditemukan`);
		}
	}

	async _deleteSongsByAlbumId(albumId) {
		const query = {
			text: "DELETE FROM songs WHERE album_id = $1",
			values: [albumId],
		};

		await this._pool.query(query);
	}
}

module.exports = AlbumsService;
