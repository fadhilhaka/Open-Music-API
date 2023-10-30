const { nanoid } = require("nanoid");
const ClientError = require("../../exceptions/ClientError");
const ServerError = require("../../exceptions/ServerError");
const NotFoundError = require("../../exceptions/NotFoundError");

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
		try {
			this._validator.validateSongQuery(request.query);
			const songs = await this._service.getAllSong(request.query);

			return {
				status: "success",
				data: {
					songs,
				},
			};
		} catch (error) {
			return this.handleError(error, h);
		}
	}

	async postSongHandler(request, h) {
		try {
			this._validator.validateSongPayload(request.payload);
			const songId = await this._service.addSong(request.payload);

			const {
				title,
				year,
				genre,
				performer,
				duration = null,
				albumId = null,
			} = request.payload;

			const response = h.response({
				status: "success",
				message: "Berhasil menambahkan lagu",
				data: {
					songId,
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
		} catch (error) {
			return this.handleError(error, h);
		}
	}

	async getSongByIdHandler(request, h) {
		const { id } = request.params;
		const songExists = await this._service._songExists(id);

		if (!songExists) {
			const error = new NotFoundError("Lagu tidak ditemukan");
			return this.handleError(error, h);
		}

		try {
			const song = await this._service.getSongById(id);
			return {
				status: "success",
				data: {
					song,
				},
			};
		} catch (error) {
			return this.handleError(error, h);
		}
	}

	async putSongByIdHandler(request, h) {
		const { id } = request.params;
		const songExists = await this._service._songExists(id);

		if (!songExists) {
			const error = new NotFoundError("Lagu tidak ditemukan");
			return this.handleError(error, h);
		}

		try {
			this._validator.validateSongPayload(request.payload);
		} catch (error) {
			const clientError = new ClientError(error.message);
			return this.handleError(clientError, h);
		}

		try {
			await this._service.editSongById(id, request.payload);

			return {
				status: "success",
				message: "Lagu berhasil diperbarui",
			};
		} catch (error) {
			return this.handleError(error, h);
		}
	}

	async deleteSongByIdHandler(request, h) {
		const { id } = request.params;
		const songExists = await this._service._songExists(id);

		if (!songExists) {
			const error = new NotFoundError("Lagu tidak ditemukan");
			return this.handleError(error, h);
		}

		try {
			await this._service.deleteSongById(id);

			return {
				status: "success",
				message: "Lagu berhasil dihapus",
			};
		} catch (error) {
			this.handleError(error, h);
		}
	}

	handleError(error, h) {
		if (error instanceof ClientError || error instanceof NotFoundError) {
			return this.getResponseError(error, h);
		} else {
			const serverError = new ServerError(
				"Maaf, terjadi kegagalan pada server kami."
			);

			serverError.statusCode = 500;
			return this.getResponseError(serverError, h);
		}
	}

	getResponseError(error, h) {
		const response = h.response({
			status: "fail",
			message: error.message,
		});

		response.code(error.statusCode);
		console.error(error);
		return response;
	}
}

module.exports = SongHandler;
