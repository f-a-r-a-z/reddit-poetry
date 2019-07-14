import React from 'react';
import './App.css';

class App extends React.Component {
	componentDidMount() {
		setRandomBackgroundColor();
	}

	render() {
		const urlParams = new URLSearchParams(window.location.search);
		const subreddit = urlParams.get("subreddit") || "";
		const hasSubredditInput = subreddit.length > 0;

		return (
			<div className="App text-style">
				<SubredditInput subreddit={subreddit} />
				{hasSubredditInput
					? <SubredditPoem subreddit={subreddit} />
					: <EnterMessage />}
				<br />
				<Footer />
			</div>
		);
	}
}

function setRandomBackgroundColor() {
	const backgroundColors = ['#7BAE7F', '#DF2935', '#C68F61', '#412722', '#6320EE', '#211A1D', '#829EAF', '#FF934F', '#735D78', '#839E8E', '#861657'];
	const backgroundColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
	document.querySelector('.App').style.setProperty('--bg-color', backgroundColor);
}

function SubredditInput(props) {
	return (
		<form method="get" className="subreddit-input">
			<label htmlFor="subreddit" hidden={true}>Subreddit: </label>
			/r/<input
				type="text"
				name="subreddit"
				defaultValue={props.subreddit}
				className="text-style"
				spellCheck="false"
				placeholder="AskReddit"
				autoComplete="off" />
			<SubredditSubmit />
		</form>
	);
}

function SubredditSubmit() {
	return (
		<div className="subreddit-submit">
			<button
			className="subreddit-submit-button text-style">
				→
			</button>
		</div>
	);
}

async function getPoemJSON(subreddit) {
	const apiUrl = new URL('https://redditpoetry.herokuapp.com');
	apiUrl.searchParams.set('subreddit', subreddit);
	try {
		const apiResponse = await fetch(apiUrl.toString());
		const poemJSON = await apiResponse.json();
		return poemJSON;
	} catch(error) {
		return [];
	}
}

function getPoemJSX(poemJSON) {
	return poemJSON.map(json =>
		<PoemLine
			title={json.title}
			permalink={json.permalink}
			key={json.permalink}
		/>
	);
}

class SubredditPoem extends React.Component {
	state = {
		loading: true,
		poemJSON: null
	};

	componentDidMount() {
		getPoemJSON(this.props.subreddit)
			.then(json => this.setState({poemJSON: json}))
			.then(() => this.setState({loading: false}));
	}

	render() {
		const {loading, poemJSON} = this.state;
		let jsx;

		if (loading) {
			jsx = <Loading />;
		} else if (!poemJSON || poemJSON.length < 2) {
			jsx = <Error />;
		} else {
			jsx = getPoemJSX(poemJSON);
		}

		return (
			<center>
				<article className="subreddit-poem">
					{jsx}
				</article>
			</center>
		);
	}
}

function PoemLine(props) {
	return (
		<p className="subreddit-poem-line">
			<a
				href={`https://reddit.com${props.permalink}`}
				className="link text-style"
				dangerouslySetInnerHTML={{__html: props.title}} // Prevent react double-escaping html
			></a>
			<br />
		</p>
	);
}

function EnterMessage() {
	return (
		<p>
			Enter a subreddit
		</p>
	);
}

function Loading() {
	return (
		<p>
			Loading...
		</p>
	);
}

function Error() {
	return (
		<p>
			Something went wrong...
		</p>
	);
}

function Footer() {
	return (
		<footer>
				Poems refreshed daily | <a
				href="https://github.com/f-a-r-a-z/reddit-poetry"
				className="link text-style">
					Source on GitHub
				</a>
		</footer>
	);
}

export default App;
