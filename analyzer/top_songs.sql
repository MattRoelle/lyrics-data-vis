SELECT
	s.title,
	s.artist_name AS artistName,
	s.release AS albumName,
	s.year,
	count
FROM lyrics.lyrics l
JOIN songs s ON l.track_id = s.track_id
WHERE word = @word
ORDER BY count DESC
LIMIT 5