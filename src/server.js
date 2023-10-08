require("dotenv").config();

const Hapi = require("@hapi/hapi");
const albums = require("./api/albums");
const AlbumsService = require("./services/inMemory/AlbumsService");
const AlbumsValidator = require("./validator/albums");
const songs = require("./api/songs");
const SongsService = require("./services/inMemory/SongsService");
const SongsValidator = require("./validator/songs");

const init = async () => {
	const albumsService = new AlbumsService();
	const songsService = new SongsService(albumsService);

	const server = Hapi.server({
		port: process.env.PORT,
		host: process.env.HOST,
		routes: {
			cors: {
				origin: ["*"],
			},
		},
	});

	await server.register({
		plugin: albums,
		options: {
			service: albumsService,
			validator: AlbumsValidator,
		},
	});

	await server.register({
		plugin: songs,
		options: {
			service: songsService,
			validator: SongsValidator,
		},
	});

	await server.start();
	console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
