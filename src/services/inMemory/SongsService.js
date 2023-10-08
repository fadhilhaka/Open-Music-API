const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class SongsService {
	constructor(albumService) {
		this._songs = [];
		this._albumService = albumService;
	}

	async getAlbumName(albumId) {
		let albumName = "";
		const albumIdIsEmpty = albumId.length === 0;

		if (!albumIdIsEmpty) {
			const albumData = await this._albumService.getAlbumById(albumId);
			albumName = albumData.name;
			console.log(`getAlbumName 1 ${albumName}`);
		}
		console.log(`getAlbumName 2 ${albumName}`);
		return albumName;
	}

	getAllSong() {
		return this._songs;
	}

	async addSong({
		title,
		year,
		genre,
		performer,
		duration = "",
		albumId = "",
	}) {
		const id = nanoid(16);
		const createdAt = new Date().toISOString();
		const updatedAt = createdAt;
		const albumName = await this.getAlbumName(albumId);

		const newSong = {
			title,
			year,
			genre,
			performer,
			duration,
			id,
			albumId,
			albumName,
			createdAt,
			updatedAt,
		};

		this._songs.push(newSong);
		console.log(`addSong ${albumName} == ${newSong.albumName}`);
		const isSuccess = this._songs.filter((song) => song.id === id).length > 0;

		if (!isSuccess) {
			throw new InvariantError("Gagal menambahkan album");
		}

		return id;
	}

	getSongById(id) {
		const song = this._songs.filter((n) => n.id === id)[0];
		if (!song) {
			throw new NotFoundError("Lagu tidak ditemukan");
		}
		console.log(`getSongById ${song.albumName}`);
		return song;
	}

	editSongById(id, songData) {
		const index = this._songs.findIndex((song) => song.id === id);

		if (index === -1) {
			throw new NotFoundError("Gagal memperbarui lagu. Id tidak ditemukan");
		}

		const {
			title,
			year,
			genre,
			performer,
			duration = "",
			albumId = "",
			albumName = "",
		} = songData;
		const updatedAt = new Date().toISOString();
		console.log(`getSongById ${albumName}`);
		this._songs[index] = {
			...this._songs[index],
			title,
			year,
			genre,
			performer,
			duration,
			albumId,
			albumName,
			updatedAt,
		};
	}

	deleteSongById(id) {
		const index = this._albums.findIndex((album) => album.id === id);

		if (index === -1) {
			throw new NotFoundError("Lagu gagal dihapus. Id tidak ditemukan");
		}

		this._albums.splice(index, 1);
	}
}

module.exports = SongsService;
