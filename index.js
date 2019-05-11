const pronounciations = require('cmu-pronouncing-dictionary');
const getJSON = require('get-json');
const extractwords = require('extractwords');
const express = require('express');
const app = express();

// Globals
const verses = 5;
let rhymingTitlesMap = {};
let redditAfterId = '';
let bytesUsed = 0;
let currentTimeSpan = 0;

const timeSpans = ['day', 'week', 'month', 'all'];
const mb = 2**20;

app.get('/', async (req, res) => {
    const subreddit = req.params.subreddit || '';
    
    if (!subreddit) return res.send('');

    const poem = await main(subreddit);

    return res.send(poem);
});

app.listen(process.env.PORT,
    () => console.log(`Example app listening on port ${process.env.PORT}!`)
);


async function main(subreddit, verses) {
    rhymingTitlesMap = {};
    redditAfterId = '';
    bytesUsed = 0;
    currentTimeSpan = 0;

    while (numberOfVerses() < verses && bytesUsed < 5*mb) {
        let titles;

        try {
            titles = await getMoreRedditTitles(subreddit);
        } catch(error) {
            break;
        }

        for (let title of titles) {
            if (!invalidTitle(title)) addToRhymingMap(title);
        }
    }

    return createPoem();
}


async function getMoreRedditTitles(subreddit) {
    if (redditAfterId === null) currentTimeSpan++;
    if (currentTimeSpan >= timeSpans.length) throw new Exception('Ran out of titles...');

    const url = `https://www.reddit.com/r/${subreddit}/top/.json?after=${redditAfterId}&t=${timeSpans[currentTimeSpan]}`;
    const json = await getJSON(url);
    bytesUsed += JSON.stringify(json).length; // for debugging

    redditAfterId = json.data.after;
    return json.data.children
        .filter(data => data.kind === 't3')
        .map(post => post.data.title);
}

function invalidTitle(title) {
    const hasNumber = title.search(/[0-9]/g) >= 0;
    const tooLong = title.length > 100;
    const tooShort = title.length < 30;
    return hasNumber || tooLong || tooShort;
} 

function addToRhymingMap(title) {
    const words = extractwords(title);
    const rhymingPart = extractRhymingPart(words[words.length - 1]);
    if (rhymingPart === '') return;

    if (!rhymingTitlesMap[rhymingPart]) {
        rhymingTitlesMap[rhymingPart] = [];
    }

    if (!titleHasSameRhymeAsAnotherTitle(title, rhymingPart)) {
        rhymingTitlesMap[rhymingPart].push(title);
    }
}

// thanks to my bro 'Plate': https://stackoverflow.com/a/32322338
function extractRhymingPart(word) {
    const lowerCaseWord = word.toLowerCase();
    const pronounciation = pronounciations[lowerCaseWord] || '';
    const stresses = pronounciation.split(' ');
    const searchStress = pronounciation.includes('1') ? '1' : '2';
    
    for (let i = stresses.length - 1; i >= 0; i--) {
        if (stresses[i].includes(searchStress)) {
            return stresses.slice(i).join(' ');
        }
    }

    return '';
}

function endWithSameWord(titleA, titleB) {
    return extractwords(titleA).pop().toLowerCase() === extractwords(titleB).pop().toLowerCase(); 
}

function titleHasSameRhymeAsAnotherTitle(title, rhymingPart) {
    return rhymingTitlesMap[rhymingPart].some(rhymingTitle => endWithSameWord(rhymingTitle, title));
}

function numberOfVerses() {
    let count = 0;

    for (let rhymingPart in rhymingTitlesMap) {
        count += Math.floor(rhymingTitlesMap[rhymingPart].length / 2);
    }

    return count;
}

function createPoem() {
    let titles = [];
    for (let rhymingPart in rhymingTitlesMap) {
        let rhymingTitlesArray = rhymingTitlesMap[rhymingPart];
        if (rhymingTitlesArray.length % 2 !== 0) rhymingTitlesArray.pop();

        if (rhymingTitlesArray.length > 0) {
            titles = titles.concat(rhymingTitlesArray);
        }
    }

    return titles.join('\n');
}
