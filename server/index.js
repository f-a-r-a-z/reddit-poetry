const cors = require('cors');
const express = require('express');
const cache = require('./cache.js');
const getPoemJSON = require('./poetry.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', cors(), async (request, response) => {
	const subreddit = (request.query.subreddit || '').toLowerCase();
	let poemJSON = [];

	if (!subreddit) {
		return response.json(poemJSON);
	}

	const cached = cache.has(subreddit);
	if (cached) {
		poemJSON = cache.getIfPresent(subreddit) || poemJSON;
	}

	const badCache = cached && (!poemJSON || !poemJSON.length || poemJSON.length < 2);
	if (!cached || badCache) {
		poemJSON = await getPoemJSON(subreddit);
		cache.set(subreddit, poemJSON);
	}

	return response.json(poemJSON);
});

app.listen(
	PORT,
	() => console.log(`App is listening on port ${PORT}!`)
);
