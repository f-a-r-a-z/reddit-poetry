const sleep = require('sleep-promise');
const {newCache, RemovalReason} = require('transitory');
const getPoemJSONString = require('./poetry.js');

const isProduction = process.env.NODE_ENV === 'production';
const DAY_MS = 24 * 60 * 60 * 1000;
const CACHE_RESET_TIME_MS = DAY_MS;
const CACHE_MAX_ITEMS = 100;

const whenCacheItemRemoved = (subreddit, poemJSONString, reason) => {
	if (reason === RemovalReason.EXPIRED) {
		warmUpCache([subreddit]);
	}
};

const cache = newCache()
	.maxSize(CACHE_MAX_ITEMS)
	.expireAfterWrite(CACHE_RESET_TIME_MS)
	.withRemovalListener(whenCacheItemRemoved)
	.build();

setInterval(() => cache.cleanUp(), CACHE_RESET_TIME_MS);

if (isProduction) {
	console.log('Warming up cache');
	const mostPopularSubreddits = ['announcements', 'funny', 'AskReddit', 'gaming', 'pics', 'science', 'worldnews', 'todayilearned', 'aww', 'movies', 'videos', 'Music', 'IAmA', 'gifs', 'news', 'EarthPorn', 'askscience', 'Showerthoughts', 'blog', 'explainlikeimfive', 'books', 'Jokes', 'DIY', 'LifeProTips', 'food', 'mildlyinteresting', 'Art', 'sports', 'television', 'space', 'gadgets', 'nottheonion', 'photoshopbattles', 'Documentaries', 'listentothis', 'GetMotivated', 'UpliftingNews', 'tifu', 'InternetIsBeautiful', 'history', 'Futurology', 'philosophy', 'OldSchoolCool', 'personalfinance', 'WritingPrompts', 'dataisbeautiful', 'nosleep', 'creepy', 'TwoXChromosomes', 'technology', 'Fitness', 'AdviceAnimals', 'WTF', 'politics', 'bestof', 'memes', 'wholesomememes', 'interestingasfuck', 'BlackPeopleTwitter', 'oddlysatisfying', 'leagueoflegends', 'lifehacks', 'travel', 'pcmasterrace', 'facepalm', 'woahdude', 'relationships', 'atheism', 'PS', 'me', 'irl', 'dankmemes', 'nba', 'Overwatch', 'Tinder', 'AnimalsBeingBros', 'AnimalsBeingJerks', 'NatureIsFuckingLit', 'reactiongifs', 'gameofthrones', 'tattoos', 'Whatcouldgowrong', 'FoodPorn', 'malefashionadvice', 'europe', 'programming', 'trippinthroughtime', 'Unexpected', 'boardgames', 'BikiniBottomTwitter', 'gardening', 'pokemongo', 'Games', 'hiphopheads', 'instant', 'regret', 'Android', 'dadjokes', 'itookapicture', 'iphone'];
	warmUpCache(mostPopularSubreddits);
}

const warmUpCache = async (subredditList, options = {}) => {
	const MINUTE = 60 * 1000;
	const timeout = options.timeout || MINUTE;

	for (let i = 0; i < subredditList.length; i++) {
		const subreddit = subredditList[i];
		const poemJSONString = await getPoemJSONString(subreddit);
		cache.set(subreddit, poemJSONString);

		const lastElement = i === subredditList.length - 1;
		if (!lastElement) {
			await sleep(timeout);
		}
	}
};

module.exports = cache;
