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

	async _songExists(id) {
		try {
			const result = await this._pool.query({
				text: "SELECT COUNT(*) FROM songs WHERE id = $1",
				values: [id],
			});

			return result.rows[0].count > 0;
		} catch {
			return false;
		}
	}

	async addSong({
		title,
		year,
		genre,
		performer,
		duration = null,
		albumId = null,
	}) {
		const id = nanoid(16);
		const createdAt = new Date().toISOString();
		const updatedAt = createdAt;

		let query;

		if (albumId !== null) {
			query = {
				text: `
				  INSERT INTO songs
				  (id, title, year, genre, performer, duration, album_id, created_at, updated_at)
				  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
					createdAt,
					updatedAt,
				],
			};
		} else {
			query = {
				text: `
				  INSERT INTO songs
				  (id, title, year, genre, performer, duration, created_at, updated_at)
				  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
				  RETURNING id
				`,
				values: [
					id,
					title,
					year,
					genre,
					performer,
					duration,
					createdAt,
					updatedAt,
				],
			};
		}

		try {
			const result = await this._pool.query(query);

			if (!result.rows[0].id) {
				throw new InvariantError(`Gagal menambahkan lagu: ${title}`);
			}

			return id;
		} catch (error) {
			throw new InvariantError(`Gagal menambahkan lagu: ${title}`);
		}
	}

	async getAlbumName(albumId) {
		let albumName = "";
		const albumIdIsEmpty = albumId.length === 0;

		if (!albumIdIsEmpty) {
			try {
				const albumData = await this._albumService.getAlbumById(albumId);

				if (albumData) {
					albumName = albumData.name;
				} else {
					throw new NotFoundError("Album tidak ditemukan");
				}
			} catch (error) {
				throw new NotFoundError("Album Name tidak ditemukan");
			}
		}

		return albumName;
	}

	async getAllSong(songQuery) {
		try {
			let query = `SELECT * FROM songs`;
			const { title, performer } = songQuery;
			const queryParams = [];
			const queryValues = [];

			if (title) {
				queryParams.push(`title ILIKE $${queryParams.length + 1}`);
				queryValues.push(`%${title}%`);
			}

			if (performer) {
				queryParams.push(`performer ILIKE $${queryParams.length + 1}`);
				queryValues.push(`%${performer}%`);
			}

			if (queryParams.length > 0) {
				query += " WHERE " + queryParams.join(" AND ");
			}

			const result = await this._pool.query({
				text: query,
				values: queryValues,
			});

			const songs = result.rows.map(mapSongsDBToModel);
			return songs;
		} catch (error) {
			throw new InvariantError(`Gagal mencari lagu.`);
		}
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
		this.deleteAlbumSongsBySongId(id);

		const query = {
			text: "DELETE FROM songs WHERE id = $1 RETURNING id",
			values: [id],
		};

		try {
			await this._pool.query(query);
		} catch (error) {
			throw new NotFoundError(`Gagal menghapus lagu.`);
		}
	}

	async deleteAlbumSongsBySongId(songId) {
		const query = {
			text: "DELETE FROM album_songs WHERE song_id = $1",
			values: [songId],
		};

		try {
			await this._pool.query(query);
		} catch (error) {
			throw new NotFoundError(`Gagal menghapus lagu.`);
		}
	}
}

module.exports = SongsService;
