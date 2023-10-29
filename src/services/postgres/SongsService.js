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
		albumId = null,
	}) {
		console.log(`addSong ${albumId}`);
		const id = nanoid(16);
		const createdAt = new Date().toISOString();
		const updatedAt = createdAt;
		const albumName = ""; //await this.getAlbumName(albumId);

		const albumIdIsEmpty = albumId === null || albumId.length === 0;
		const newAlbumId = albumIdIsEmpty ? id : albumId;

		// albumId = newAlbumId;

		console.log(`addSong 0: =${albumName}=  =${newAlbumId}= =${albumId}=`);

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
					albumId || id,
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

		console.log(`addSong query`);
		try {
			const result = await this._pool.query(query);
			console.log(`addSong query done`);
			if (!result.rows[0].id) {
				console.log(`addSong InvariantError done`);
				throw new InvariantError(`Gagal menambahkan lagu: ${title}`);
			}

			return id;
		} catch (error) {
			console.error(`Error in addSong query: ${error.message}`);
			throw new InvariantError(`Gagal menambahkan lagu: ${title}`);
		}

		// if (!result.rows[0].id) {
		// 	console.log(`addSong InvariantError done`);
		// 	throw new InvariantError(`Gagal menambahkan lagu: ${title}`);
		// }

		// return id;
	}

	async getAlbumName(albumId) {
		let albumName = "";
		const albumIdIsEmpty = albumId.length === 0;

		if (!albumIdIsEmpty) {
			// console.log(`getAlbumName 0`);
			// const albumData = await this._albumService.getAlbumById(albumId);
			// console.log(`getAlbumName ${albumData.name}`);
			// albumName = albumData.name;
			try {
				const albumData = await this._albumService.getAlbumById(albumId);

				if (albumData) {
					console.log(`getAlbumName ${albumData.name}`);
					albumName = albumData.name;
				} else {
					console.log(`Album not found for ID: ${albumId}`);
					// Handle the case where the album is not found, you can choose to return null or an empty string.
				}
			} catch (error) {
				console.error(`Error in getAlbumName: ${error.message}`);
				// Handle the error, you can choose to return null or an empty string.
			}
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
		this.deleteAlbumSongsBySongId(id);

		const query = {
			text: "DELETE FROM songs WHERE id = $1 RETURNING id",
			values: [id],
		};
		// console.error(`Error in deleteSongById: ${id}`);
		// const result = await this._pool.query(query);
		try {
			console.log(`Deleting song with ID: ${id}`);
			const result = await this._pool.query(query);
			console.log(
				`deleteSongById query done. Deleted ${result.rowCount} rows.`
			);
		} catch (error) {
			console.error(`Error in deleteSongById query: ${error.message}`);
			throw error; // Rethrow the error to propagate it further
		}

		// if (!result.rows[0].id) {
		// 	throw new NotFoundError(`Gagal menghapus lagu. Id tidak ditemukan`);
		// }

		// if (!result.rows.length) {
		// 	throw new NotFoundError("Catatan gagal dihapus. Id tidak ditemukan");
		// }
	}

	async deleteAlbumSongsBySongId(songId) {
		const query = {
			text: "DELETE FROM album_songs WHERE song_id = $1",
			values: [songId],
		};

		try {
			const result = await this._pool.query(query);
			console.log(
				`deleteAlbumSongsBySongId query done. Deleted ${result.rowCount} rows.`
			);
		} catch (error) {
			console.error(
				`Error in deleteAlbumSongsBySongId query: ${error.message}`
			);
			throw error; // Rethrow the error to propagate it further
		}
	}
}

module.exports = SongsService;
