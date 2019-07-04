const sleep = require('sleep-promise');
const {newCache, RemovalReason} = require('transitory');
const getPoemJSON = require('./poetry.js');

const isProduction = process.env.NODE_ENV === 'production';
const DAY_MS = 24 * 60 * 60 * 1000;
const CACHE_RESET_TIME_MS = DAY_MS;
const CACHE_MAX_ITEMS = 250;

const whenCacheItemRemoved = (subreddit, poemJSON, reason) => {
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

const warmUpCache = async (subredditList, options = {}) => {
	const SECOND = 1000;
	const timeout = options.timeout || 10 * SECOND;

	for (let i = 0; i < subredditList.length; i++) {
		const subreddit = subredditList[i];
		if (cache.has(subreddit)) {
			continue;
		}
		const poemJSON = await getPoemJSON(subreddit);
		cache.set(subreddit, poemJSON);

		const lastElement = i === subredditList.length - 1;
		if (!lastElement) {
			await sleep(timeout);
		}
	}
};

if (isProduction) {
	console.log('Warming up cache');
	const mostPopularSubreddits = ['announcements', 'funny', 'askreddit', 'gaming', 'pics', 'science', 'worldnews', 'todayilearned', 'aww', 'movies', 'videos', 'music', 'iama', 'gifs', 'news', 'earthporn', 'showerthoughts', 'askscience', 'blog', 'explainlikeimfive', 'books', 'jokes', 'diy', 'lifeprotips', 'food', 'mildlyinteresting', 'art', 'sports', 'television', 'space', 'gadgets', 'nottheonion', 'photoshopbattles', 'documentaries', 'listentothis', 'getmotivated', 'upliftingnews', 'tifu', 'internetisbeautiful', 'history', 'futurology', 'philosophy', 'oldschoolcool', 'personalfinance', 'writingprompts', 'dataisbeautiful', 'nosleep', 'creepy', 'twoxchromosomes', 'technology', 'fitness', 'adviceanimals', 'wtf', 'politics', 'bestof', 'memes', 'wholesomememes', 'interestingasfuck', 'blackpeopletwitter', 'leagueoflegends', 'oddlysatisfying', 'lifehacks', 'travel', 'pcmasterrace', 'facepalm', 'woahdude', 'relationships', 'ps4', 'atheism', 'me_irl', 'dankmemes', 'nba', 'overwatch', 'animalsbeingbros', 'tinder', 'animalsbeingjerks', 'natureisfuckinglit', 'tattoos', 'reactiongifs', 'gameofthrones', 'foodporn', 'whatcouldgowrong', 'malefashionadvice', 'programming', 'europe', 'gonewild', 'trippinthroughtime', 'unexpected', 'boardgames', 'bikinibottomtwitter', 'gardening', 'pokemongo', 'games', 'hiphopheads', 'instant_regret', 'loseit', 'android', 'itookapicture', 'iphone', 'dadjokes', 'photography', 'relationship_advice', 'damnthatsinteresting', 'pewdiepiesubmissions', 'mildlyinfuriating', 'crappydesign', 'pokemon', 'slowcooking', 'gifrecipes', 'buildapc', 'rarepuppers', 'soccer', 'nonononoyes', 'drawing', 'offmychest', 'woodworking', 'wellthatsucks', 'humor', 'xboxone', 'beamazed', 'roadcam', 'cars', 'animalsbeingderps', 'keto', 'contagiouslaughter', 'eyebleach', 'bettereveryloop', 'confession', 'highqualitygifs', 'pcgaming', 'roastme', 'trashy', 'makeupaddiction', 'raspberry_pi', 'trees', 'netflixbestof', 'backpacking', 'historyporn', 'outoftheloop', 'nfl', 'nsfw', 'minecraft', 'eatcheapandhealthy', 'nsfw_gif', 'cats', 'choosingbeggars', 'childrenfallingover', 'biology', 'humansbeingbros', 'realgirls', 'frugalmalefashion', 'sex', 'teenagers', 'artisanvideos', 'cooking', 'blackmagicfuckery', 'nevertellmetheodds', 'mademesmile', 'hmmm', 'rickandmorty', 'mac', 'streetwear', 'whitepeopletwitter', 'nintendoswitch', 'comics', 'insanepeoplefacebook', 'recipes', 'quityourbullshit', 'youseeingthisshit', 'parenting', 'murderedbywords', 'nintendo', 'dnd', 'askmen', 'watchpeopledieinside', 'electronicmusic', 'scifi', 'frugal', 'fortnitebr', 'cringepics', 'therewasanattempt', 'moviedetails', 'freefolk', 'fiftyfifty', 'reallifedoodles', 'starwars', 'whatisthisthing', 'wheredidthesodago', 'howto', 'nostupidquestions', 'battlestations', 'mealprepsunday', 'wow', 'bitcoin', '4chan', 'bodyweightfitness', 'anime', 'hearthstone', 'iamverysmart', 'dundermifflin', 'youshouldknow', 'youtubehaiku', 'manga', 'peoplefuckingdying', 'assholedesign', 'camping', 'educationalgifs', 'memeeconomy', 'publicfreakout', 'learnprogramming', 'thewalkingdead', 'kidsarefuckingstupid', 'natureismetal', 'holdmybeer', 'madlads', 'apple', 'dogs', 'collegebasketball', 'thathappened', 'cringe', 'prequelmemes', 'askhistorians', 'trollychromosome', 'skincareaddiction', 'awwducational', 'socialskills', 'idiotsincars', 'destinythegame', 'starterpacks', 'baseball', 'entertainment', 'askwomen', 'imgoingtohellforthis', 'niceguys', 'wallpaper', 'japantravel', 'holdthemoan', 'outdoors', 'amitheasshole', 'horror', 'cryptocurrency', 'roomporn', 'conspiracy', 'literature', 'comicbooks', 'urbanexploration', 'globaloffensive', 'justnomil', 'atbge', 'legaladvice'];
	warmUpCache(mostPopularSubreddits);
}

module.exports = cache;
