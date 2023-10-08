const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapSongsDBToModel } = require("../../utils");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class SongsService {
	constructor(albumsService) {
		this._pool = new Pool();
		this._albumService = albumsService;
	}

	async addSong({
		title,
		year,
		genre,
		performer,
		duration = null,
		albumId = "",
	}) {
		const id = nanoid(16);
		const createdAt = new Date().toISOString();
		const updatedAt = createdAt;
		const albumName = await this.getAlbumName(albumId);

		const query = {
			text: `
              INSERT INTO songs
              (id, title, year, genre, performer, duration, album_id, album_name, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              RETURNING id
            `,
			values: [
				id,
				title,
				year,
				genre,
				performer,
				duration,
				albumId,
				albumName,
				createdAt,
				updatedAt,
			],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new InvariantError(`Gagal menambahkan lagu: ${title}`);
		}

		return { id, albumName };
	}

	async getAlbumName(albumId) {
		let albumName = "";
		const albumIdIsEmpty = albumId.length === 0;

		if (!albumIdIsEmpty) {
			const albumData = await this._albumService.getAlbumById(albumId);
			albumName = albumData.name;
		}

		return albumName;
	}

	async getAllSong() {
		const query = `SELECT * FROM songs`;
		const result = await this._pool.query(query);
		const songs = result.rows.map(mapSongsDBToModel);

		return songs;
	}

	async getSongById(id) {
		const query = {
			text: "SELECT * FROM songs WHERE id = $1",
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError("Lagu tidak ditemukan");
		}

		return result.rows.map(mapSongsDBToModel)[0];
	}

	async editSongById(id, songData) {
		const updatedAt = new Date().toISOString();

		const { title, year, genre, performer, duration, albumId } = songData;

		const query = {
			text: "UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id",
			values: [title, year, genre, performer, duration, albumId, updatedAt, id],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new NotFoundError(
				`Gagal memperbarui lagu: ${songData.name}. Id tidak ditemukan`
			);
		}
	}

	async deleteSongById(id) {
		const query = {
			text: "DELETE FROM songs WHERE id = $1 RETURNING id",
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new NotFoundError(`Gagal menghapus lagu. Id tidak ditemukan`);
		}
	}
}

module.exports = SongsService;
