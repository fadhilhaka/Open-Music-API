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
			text: "SELECT * FROM albums WHERE id = $1",
			values: [id],
		};
		console.log(`getAlbumById ${id}`);

		try {
			const result = await this._pool.query(query);

			console.log(`getAlbumById 1 ${id}`);

			if (!result.rows.length) {
				console.log(`getAlbumById album not found`);
				throw new NotFoundError("Album tidak ditemukan");
				return null; // Return null or an empty object
			}

			return result.rows.map(mapAlbumsDBToModel)[0];
		} catch (error) {
			console.error(`Error in getAlbumById: ${error.message}`);
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
