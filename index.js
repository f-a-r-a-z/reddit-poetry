const express = require('express');
const cache = require('./cache.js');
const getPoemJSONString = require('./poetry.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (request, response) => {
	const subreddit = request.query.subreddit || '';
	let poemJSONString = '[]';

	if (!subreddit) {
		return response.send(poemJSONString);
	}

	if (cache.has(subreddit)) {
		poemJSONString = cache.getIfPresent(subreddit) || poemJSONString;
	} else {
		poemJSONString = await getPoemJSONString(subreddit);
		cache.set(subreddit, poemJSONString);
	}

	return response.send(poemJSONString);
});

app.listen(
	PORT,
	() => console.log(`App is listening on port ${PORT}!`)
);
