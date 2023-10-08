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
			this._validator.validateAlbumPayload(albumData);

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
			console.log("Proses catch postAlbumHandler");
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

	async putAlbumByIdHandler(request, h) {
		try {
			const albumData = JSON.parse(request.payload);
			this._validator.validateAlbumPayload(albumData);

			const { name, year } = request.payload;
			const { id } = request.params;

			await this._service.editAlbumById(id, { name, year });

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

	async deleteAlbumByIdHandler(request, h) {
		try {
			const { id } = request.params;
			await this._service.deleteAlbumById(id);

			return {
				status: "success",
				message: "Album berhasil dihapus",
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

module.exports = AlbumHandler;
