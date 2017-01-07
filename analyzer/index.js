"use strict";

const sqlite3 = require("sqlite3");
const fs = require("fs");

const mxmDatasetFname = "mxm_dataset.db";
const trackMetadataFname = "track_metadata.db";
const analyzeOverTimeFname = "analyze_over_time.sql";
const topSongsFname = "top_songs.sql";
const wordsFname = "words";
if (!fs.existsSync(mxmDatasetFname) ||
    !fs.existsSync(trackMetadataFname) ||
    !fs.existsSync(analyzeOverTimeFname) ||
    !fs.existsSync(topSongsFname) ||
    !fs.existsSync(wordsFname)) {
    throw "Missing database, query or input file";
}

const analyzeOverTimeQuery = fs.readFileSync(analyzeOverTimeFname).toString("utf8");
const topSongsQuery = fs.readFileSync(topSongsFname).toString("utf8");

const outputDirectory = "output";
if (!fs.existsSync("output")) {
    fs.mkdirSync(outputDirectory);
}

const trackDb = new sqlite3.Database(trackMetadataFname);

const words = fs.readFileSync(wordsFname).toString("utf8").split("\r\n");

trackDb.serialize(() => {
    trackDb.run(`attach database '${mxmDatasetFname}' as lyrics`)

    let promises = [];

    words.forEach(word => {
        promises.push(analyzeWord(word, trackDb))
    });

    Promise.all(promises).then(result => {
        const fileContents = JSON.stringify(result);
        fs.writeFileSync("analysis.json", fileContents);
    });
});

function analyzeWord(word, db) {
    return new Promise((resolve, reject) => {
        let output = {
            word,
            dataOverTime: [],
            topSongs: []
        };

        const params = {
            "@word": word
        };

        db.each(analyzeOverTimeQuery, params, (err, row) => {
            if (!!err) {
                throw err;
            }

            output.dataOverTime.push(row);
        }, () => {
            db.each(topSongsQuery, params, (err, row) => {
                if (!!err) {
                    throw err;
                }

                output.topSongs.push(row);
            }, () => {
                resolve(output);
            });
        });
    });
}