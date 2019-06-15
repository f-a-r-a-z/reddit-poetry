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
	const mostPopularSubreddits = ['announcements', 'funny', 'AskReddit', 'gaming', 'pics', 'science', 'worldnews', 'todayilearned', 'aww', 'movies', 'videos', 'Music', 'IAmA', 'gifs', 'news', 'EarthPorn', 'Showerthoughts', 'askscience', 'blog', 'explainlikeimfive', 'books', 'Jokes', 'DIY', 'LifeProTips', 'food', 'mildlyinteresting', 'Art', 'sports', 'television', 'space', 'gadgets', 'nottheonion', 'photoshopbattles', 'Documentaries', 'listentothis', 'GetMotivated', 'UpliftingNews', 'tifu', 'InternetIsBeautiful', 'history', 'Futurology', 'philosophy', 'OldSchoolCool', 'personalfinance', 'WritingPrompts', 'dataisbeautiful', 'nosleep', 'creepy', 'TwoXChromosomes', 'technology', 'Fitness', 'AdviceAnimals', 'WTF', 'politics', 'bestof', 'memes', 'wholesomememes', 'interestingasfuck', 'BlackPeopleTwitter', 'leagueoflegends', 'oddlysatisfying', 'lifehacks', 'travel', 'pcmasterrace', 'facepalm', 'woahdude', 'relationships', 'PS4', 'atheism', 'me_irl', 'dankmemes', 'nba', 'Overwatch', 'AnimalsBeingBros', 'Tinder', 'AnimalsBeingJerks', 'NatureIsFuckingLit', 'tattoos', 'reactiongifs', 'gameofthrones', 'FoodPorn', 'Whatcouldgowrong', 'malefashionadvice', 'programming', 'europe', 'gonewild', 'trippinthroughtime', 'Unexpected', 'boardgames', 'BikiniBottomTwitter', 'gardening', 'pokemongo', 'Games', 'hiphopheads', 'instant_regret', 'loseit', 'Android', 'itookapicture', 'iphone', 'dadjokes', 'photography', 'relationship_advice', 'Damnthatsinteresting', 'PewdiepieSubmissions', 'mildlyinfuriating', 'CrappyDesign', 'pokemon', 'slowcooking', 'GifRecipes', 'buildapc', 'rarepuppers', 'soccer', 'nonononoyes', 'drawing', 'offmychest', 'woodworking', 'Wellthatsucks', 'humor', 'xboxone', 'BeAmazed', 'Roadcam', 'cars', 'AnimalsBeingDerps', 'keto', 'ContagiousLaughter', 'Eyebleach', 'BetterEveryLoop', 'confession', 'HighQualityGifs', 'pcgaming', 'RoastMe', 'trashy', 'MakeupAddiction', 'raspberry_pi', 'trees', 'NetflixBestOf', 'backpacking', 'HistoryPorn', 'OutOfTheLoop', 'nfl', 'nsfw', 'Minecraft', 'EatCheapAndHealthy', 'NSFW_GIF', 'cats', 'ChoosingBeggars', 'ChildrenFallingOver', 'biology', 'HumansBeingBros', 'RealGirls', 'frugalmalefashion', 'sex', 'teenagers', 'ArtisanVideos', 'Cooking', 'blackmagicfuckery', 'nevertellmetheodds', 'MadeMeSmile', 'hmmm', 'rickandmorty', 'mac', 'streetwear', 'WhitePeopleTwitter', 'NintendoSwitch', 'comics', 'insanepeoplefacebook', 'recipes', 'quityourbullshit', 'youseeingthisshit', 'Parenting', 'MurderedByWords', 'nintendo', 'DnD', 'AskMen', 'WatchPeopleDieInside', 'electronicmusic', 'scifi', 'Frugal', 'FortNiteBR', 'cringepics', 'therewasanattempt', 'MovieDetails', 'freefolk', 'FiftyFifty', 'reallifedoodles', 'StarWars', 'whatisthisthing', 'wheredidthesodago', 'howto', 'NoStupidQuestions', 'battlestations', 'MealPrepSunday', 'wow', 'Bitcoin', '4chan', 'bodyweightfitness', 'anime', 'hearthstone', 'iamverysmart', 'DunderMifflin', 'YouShouldKnow', 'youtubehaiku', 'manga', 'PeopleFuckingDying', 'assholedesign', 'camping', 'educationalgifs', 'MemeEconomy', 'PublicFreakout', 'learnprogramming', 'thewalkingdead', 'KidsAreFuckingStupid', 'natureismetal', 'holdmybeer', 'madlads', 'apple', 'dogs', 'CollegeBasketball', 'thatHappened', 'cringe', 'PrequelMemes', 'AskHistorians', 'TrollYChromosome', 'SkincareAddiction', 'Awwducational', 'socialskills', 'IdiotsInCars', 'DestinyTheGame', 'starterpacks', 'baseball', 'entertainment', 'AskWomen', 'ImGoingToHellForThis', 'niceguys', 'wallpaper', 'JapanTravel', 'holdthemoan', 'Outdoors', 'AmItheAsshole', 'horror', 'CryptoCurrency', 'RoomPorn', 'conspiracy', 'literature', 'comicbooks', 'urbanexploration', 'GlobalOffensive', 'JUSTNOMIL', 'ATBGE', 'legaladvice'];
	warmUpCache(mostPopularSubreddits);
}

module.exports = cache;
