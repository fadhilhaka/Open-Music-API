const mapAlbumsDBToModel = ({ id, name, year, created_at, updated_at }) => ({
	id,
	name,
	year,
	createdAt: created_at,
	updatedAt: updated_at,
});

const mapSongsDBToModel = ({
	id,
	title,
	year,
	genre,
	performer,
	duration,
	album_id,
	album_name,
	created_at,
	updated_at,
}) => ({
	id,
	title,
	year,
	genre,
	performer,
	duration,
	albumId: album_id,
	albumName: album_name,
	createdAt: created_at,
	updatedAt: updated_at,
});

module.exports = { mapAlbumsDBToModel, mapSongsDBToModel };
