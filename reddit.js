const getJSON = require('get-json');

class Reddit {
	constructor(subreddit, options = {}) {
		this.subreddit = subreddit;
		this.afterID = '';
		this.currentTimeSpanIndex = 0;
		this.pages = 0;
		this.options = {
			...this.defaults,
			...options
		};
	}

	async getPosts() {
		this.pages++;
		if (this.pageLimitExceeded || this.timeSpansFinished) {
			return null;
		}

		if (this.currentTimeSpanPagesFinished) {
			this.currentTimeSpanIndex++;
		}

		const json = await getJSON(this.url);
		this.afterID = json.data.after;
		const posts = json.data.children
			.filter(data => data.kind === 't3')
			.map(data => data.data)
			.map(data => ({title: data.title, permalink: data.permalink}));

		return posts;
	}

	get url() {
		return `https://www.reddit.com/r/${this.subreddit}/top/.json?after=${this.afterID}&t=${this.currentTimeSpan}&count=100&limit=100`;
	}

	get currentTimeSpan() {
		return this.timeSpans[this.currentTimeSpanIndex];
	}

	get timeSpans() {
		return ['day', 'week', 'month', 'all'];
	}

	get timeSpansFinished() {
		return this.currentTimeSpanIndex >= this.timeSpans.length;
	}

	get currentTimeSpanPagesFinished() {
		return this.afterID === null;
	}

	get pageLimitExceeded() {
		return this.pages >= this.options.maxPages;
	}

	get defaults() {
		return {
			maxPages: 30
		};
	}
}

module.exports = Reddit;
