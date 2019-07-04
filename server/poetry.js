const extractwords = require('extractwords');
const extractRhymingPart = require('rhyming-part');
const Reddit = require('./reddit.js');

class RedditPoem {
	constructor(subreddit, options = {}) {
		this.subreddit = subreddit;
		this.reddit = new Reddit(subreddit);
		this.rhymeToPostsMap = {};
		this.options = {
			...this.defaults,
			...options
		};
	}

	async generateJSON() {
		while (this.needMoreRedditPosts()) {
			let posts;

			try {
				posts = await this.reddit.getPosts();
			} catch(exception) {
				break;
			}

			if (!posts) {
				break;
			}

			this.addRedditPosts(posts);
		}

		return this.poemPosts;
	}

	needMoreRedditPosts() {
		return this.verses < this.options.verses;
	}

	addRedditPosts(posts) {
		for (let post of posts) {
			if (!this.invalidTitle(post.title) && !this.alreadyInRhymingMap(post.title)) {
				this.addToRhymeMap(post);
			}
		}
	}

	get verses() {
		return this.poemPosts.length / 2;
	}

	get poemPosts() {
		let posts = [];
		for (let rhymingPart in this.rhymeToPostsMap) {
			const rhymingPosts = this.rhymeToPostsMap[rhymingPart];

			const oddNumberOfPosts = rhymingPosts.length % 2 === 1;
			const numberOfPostsToUse = rhymingPosts.length - Number(oddNumberOfPosts);

			const rhymingPostsToUse = rhymingPosts.slice(0, numberOfPostsToUse);

			if (rhymingPostsToUse.length > 0) {
				posts = posts.concat(rhymingPostsToUse);
			}
		}
		return posts;
	}

	invalidTitle(title) {
		const lastWord = extractwords(title, {punctuation: true}).pop();

		const hasNumber = /\d/.test(lastWord);
		const hasAmbiguousPunctuation = /[+&%#@$£¢]/.test(lastWord); // # -> sharp or hash etc
		const weirdCharacters = lastWord.split("").map(char => char.charCodeAt(0)).some(charCode => charCode > 191); // Strange characters like ÅØ
		const tooLong = title.length > this.options.maxTitleLength;
		const tooShort = title.length < this.options.minTitleLength;
		return hasNumber || hasAmbiguousPunctuation || tooLong || tooShort || weirdCharacters;
	}

	alreadyInRhymingMap(title) {
		const rhymingPart = extractRhymingPart(title);
		return this.rhymeToPostsMap[rhymingPart] && this.rhymeToPostsMap[rhymingPart].some(post => this.endsWithSameWord(post.title, title));
	}

	endsWithSameWord(titleA, titleB) {
		const wordsA = extractwords(titleA, {lowercase: true});
		const wordsB = extractwords(titleB, {lowercase: true});
		const lastWordA = wordsA.pop();
		const lastWordB = wordsB.pop();
		return lastWordA.includes(lastWordB) || lastWordB.includes(lastWordA);
	}

	addToRhymeMap(post) {
		const rhymingPart = extractRhymingPart(post.title);
		if (!rhymingPart) return;

		if (!this.rhymeToPostsMap[rhymingPart]) {
			this.rhymeToPostsMap[rhymingPart] = [];
		}

		this.rhymeToPostsMap[rhymingPart].push(post);
	}

	get defaults() {
		return {
			verses: 3,
			maxTitleLength: 80,
			minTitleLength: 15
		};
	}
}

const getPoemJSON = async (subreddit, options = {}) => {
	try {
		const poem = new RedditPoem(subreddit, options);
		const poemJSON = await poem.generateJSON();
		return poemJSON;
	} catch (error) {
		return [];
	}
};

module.exports = getPoemJSON;
