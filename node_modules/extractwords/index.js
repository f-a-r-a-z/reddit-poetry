const defaults = {
	lowercase: false,
	punctuation: false
};

module.exports = (str, options = {}) => {
	options = {
		...defaults,
		...options
	};

	let words;
	if (options.punctuation) {
		words = str.match(/\S+/g) || [];
	} else {
		words = str.match(/[a-zA-Z]+('[a-zA-Z]+)?/g) || [];
	}

	if (options.lowercase) {
		words = words.map(str => str.toLowerCase());
	}

	return words;
};
