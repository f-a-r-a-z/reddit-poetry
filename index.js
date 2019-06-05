const cache = require('memory-cache');
const express = require('express');
const app = express();
const RedditPoem = require('./poetry.js');


app.get('/', async (req, res) => {
    const subreddit = req.query.subreddit || '';

    if (!subreddit) return res.send('');

    return res.send(await getPoem(subreddit));
});

app.listen(process.env.PORT,
    () => console.log(`App is listening on port ${process.env.PORT}!`)
);

const getPoem = async subreddit => {
    try {
        const poem = new RedditPoem(subreddit);
        const poem_json = await poem.generateJSON();
        return JSON.stringify(poem_json);
    } catch(exception) {
        return '[]';
    }
};
