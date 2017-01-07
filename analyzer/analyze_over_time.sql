SELECT
	src.year,
	src.word_count AS wordCount,
	src.number_of_songs_containing_word AS numberOfSongsContainingWord,
	year_count.songs_in_year AS songsInYear,
	100*(CAST(src.number_of_songs_containing_word AS REAL) / CAST(year_count.songs_in_year AS REAL)) AS percentageOfSongsContainingWord
FROM
(
	SELECT
		SUM(l.count) AS word_count,
		COUNT(*) AS number_of_songs_containing_word,
		s.year
	FROM lyrics.lyrics l
	JOIN songs s ON l.track_id = s.track_id
	WHERE l.word = @word
	AND s.year <> 0
	GROUP BY s.year
) src
JOIN
(
	SELECT
		s.year,
		COUNT(*) AS songs_in_year
	FROM songs s
	GROUP BY s.year
) year_count ON year_count.year = src.year