const { nanoid } = require("nanoid");
const ClientError = require("../../exceptions/ClientError");
const ServerError = require("../../exceptions/ServerError");
const NotFoundError = require("../../exceptions/NotFoundError");

class AlbumHandler {
	constructor(service, validator) {
		this._service = service;
		this._validator = validator;

		this.getAllAlbumHandler = this.getAllAlbumHandler.bind(this);
		this.postAlbumHandler = this.postAlbumHandler.bind(this);
		this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
		this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
		this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
	}

	async getAllAlbumHandler(request, h) {
		const albums = await this._service.getAlbums();
		return {
			status: "success",
			data: {
				albums,
			},
		};
	}

	async postAlbumHandler(request, h) {
		try {
			try {
				this._validator.validateAlbumPayload(request.payload);
			} catch (error) {
				return this.handleError(error, h);
			}

			const albumId = await this._service.addAlbum(request.payload);
			const { name, year } = request.payload;

			const response = h.response({
				status: "success",
				message: "Berhasil menambahkan album",
				data: {
					albumId,
					name,
					year,
				},
			});
			response.code(201);
			return response;
		} catch (error) {
			return this.handleError(error, h);
		}
	}

	async getAlbumByIdHandler(request, h) {
		try {
			const { id } = request.params;
			const album = await this._service.getAlbumById(id);

			if (album === null) {
				throw new NotFoundError("Album tidak ditemukan");
			}

			return {
				status: "success",
				data: {
					album,
				},
			};
		} catch (error) {
			return this.handleError(error, h);
		}
	}

	async putAlbumByIdHandler(request, h) {
		try {
			try {
				this._validator.validateAlbumPayload(request.payload);
			} catch (error) {
				return this.handleError(error, h);
			}

			const { name, year } = request.payload;
			const { id } = request.params;

			try {
				await this._service.editAlbumById(id, { name, year });
			} catch (error) {
				return this.handleError(error, h);
			}

			return {
				status: "success",
				message: "Album berhasil diperbarui",
			};
		} catch (error) {
			return this.handleError(error, h);
		}
	}

	async deleteAlbumByIdHandler(request, h) {
		try {
			const { id } = request.params;
			await this._service.deleteAlbumById(id);

			return {
				status: "success",
				message: "Album berhasil dihapus",
			};
		} catch (error) {
			return this.handleError(error, h);
		}
	}

	handleError(error, h) {
		if (error instanceof ClientError) {
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

module.exports = AlbumHandler;
