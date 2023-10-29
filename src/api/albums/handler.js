const { nanoid } = require("nanoid");
const ClientError = require("../../exceptions/ClientError");

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
			const albumData = JSON.parse(request.payload);

			try {
				this._validator.validateAlbumPayload(albumData);
			} catch (error) {
				return this.getResponseError(error, h);
			}

			const albumId = await this._service.addAlbum(albumData);
			const { name, year } = albumData;

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
		} catch {
			this.handleError(error, h);
		}
	}

	async getAlbumByIdHandler(request, h) {
		try {
			const { id } = request.params;
			const album = await this._service.getAlbumById(id);

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

	async putAlbumByIdHandler(request, h) {
		try {
			const albumData = JSON.parse(request.payload);

			try {
				this._validator.validateAlbumPayload(albumData);
			} catch (error) {
				return this.getResponseError(error, h);
			}

			const { name, year } = request.payload;
			const { id } = request.params;

			await this._service.editAlbumById(id, { name, year });

			return {
				status: "success",
				message: "Album berhasil diperbarui",
			};
		} catch (error) {
			this.handleError(error, h);
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

module.exports = AlbumHandler;
