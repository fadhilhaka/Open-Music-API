const { nanoid } = require("nanoid");
const ClientError = require("../../exceptions/ClientError");

class SongHandler {
	constructor(service, validator) {
		this._service = service;
		this._validator = validator;

		this.getAllSongHandler = this.getAllSongHandler.bind(this);
		this.postSongHandler = this.postSongHandler.bind(this);
		this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
		this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
		this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
	}

	async getAllSongHandler(request, h) {
		const songs = await this._service.getAllSong();
		return {
			status: "success",
			data: {
				songs,
			},
		};
	}

	async postSongHandler(request, h) {
		try {
			const songData = JSON.parse(request.payload);
			this._validator.validateSongPayload(songData);

			const { id, albumName } = await this._service.addSong(songData);

			const {
				title,
				year,
				genre,
				performer,
				duration = null,
				albumId = "",
			} = songData;

			const response = h.response({
				status: "success",
				message: "Berhasil menambahkan lagu",
				data: {
					id,
					title,
					year,
					genre,
					performer,
					duration,
					albumId,
					albumName,
				},
			});

			response.code(201);
			return response;
		} catch {
			if (error instanceof ClientError) {
				const response = h.response({
					status: "fail",
					message: error.message,
				});
				response.code(error.statusCode);
				return response;
			}

			// Server ERROR!
			const response = h.response({
				status: "error",
				message: "Maaf, terjadi kegagalan pada server kami.",
			});
			response.code(500);
			console.error(error);
			return response;
		}
	}

	async getSongByIdHandler(request, h) {
		try {
			const { id } = request.params;
			const album = await this._service.getSongById(id);
			return {
				status: "success",
				data: {
					album,
				},
			};
		} catch (error) {
			if (error instanceof ClientError) {
				const response = h.response({
					status: "fail",
					message: error.message,
				});
				response.code(error.statusCode);
				return response;
			}

			// Server ERROR!
			const response = h.response({
				status: "error",
				message: "Maaf, terjadi kegagalan pada server kami.",
			});
			response.code(500);
			console.error(error);
			return response;
		}
	}

	async putSongByIdHandler(request, h) {
		try {
			const songData = JSON.parse(request.payload);
			this._validator.validateSongPayload(songData);

			const { id } = request.params;

			await this._service.editSongById(id, songData);

			return {
				status: "success",
				message: "Album berhasil diperbarui",
			};
		} catch (error) {
			if (error instanceof ClientError) {
				const response = h.response({
					status: "fail",
					message: error.message,
				});
				response.code(error.statusCode);
				return response;
			}

			// Server ERROR!
			const response = h.response({
				status: "error",
				message: "Maaf, terjadi kegagalan pada server kami.",
			});
			response.code(500);
			console.error(error);
			return response;
		}
	}

	async deleteSongByIdHandler(request, h) {
		try {
			const { id } = request.params;
			await this._service.deleteSongById(id);

			return {
				status: "success",
				message: "Lagu berhasil dihapus",
			};
		} catch (error) {
			if (error instanceof ClientError) {
				const response = h.response({
					status: "fail",
					message: error.message,
				});
				response.code(error.statusCode);
				return response;
			}

			// Server ERROR!
			const response = h.response({
				status: "error",
				message: "Maaf, terjadi kegagalan pada server kami.",
			});
			response.code(500);
			console.error(error);
			return response;
		}
	}
}

module.exports = SongHandler;
