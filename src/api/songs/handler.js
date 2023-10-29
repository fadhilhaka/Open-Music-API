const { nanoid } = require("nanoid");
const ClientError = require("../../exceptions/ClientError");
const ServerError = require("../../exceptions/ServerError");

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

			try {
				this._validator.validateSongPayload(songData);
			} catch (error) {
				return this.getResponseError(error, h);
			}

			let id = "";

			try {
				id = await this._service.addSong(songData);
			} catch (error) {
				throw this.getResponseError(error, h);
			}

			const {
				title,
				year,
				genre,
				performer,
				duration = null,
				albumId = null,
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
				},
			});

			response.code(201);
			return response;
		} catch {
			this.handleError(error, h);
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
			this.handleError(error, h);
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
			this.handleError(error, h);
		}
	}

	async deleteSongByIdHandler(request, h) {
		try {
			const { id } = request.params;
			console.log(`deleteSongByIdHandler`);
			await this._service.deleteSongById(id);
			console.log(`deleteSongByIdHandler done`);

			return {
				status: "success",
				message: "Lagu berhasil dihapus",
			};
		} catch (error) {
			this.handleError(error, h);
		}
	}

	handleError(error, h) {
		if (error instanceof ClientError) {
			return this.getResponseError(error, h);
		} else {
			const serverError = new ServerError(
				"Maaf, terjadi kegagalan pada server kami."
			);

			this.getResponseError(serverError, h);
		}
	}

	getResponseError(error, h) {
		const response = h.response({
			status: error.name,
			statusCode: error.statusCode,
			message: error.message,
		});

		console.error(error);
		return response;
	}
}

module.exports = SongHandler;
