# Reddit Poetry
Randomly generate poetry from Reddit titles: http://f-a-r-a-z.github.io/reddit-poetry

## Building
Firstly fork the repository and pull its contents onto your machine
### Backend
The backend is an Express.js api endpoint hosted on Heroku. It takes a GET request at its root with a `subreddit` parameter and responds with JSON for the poem.
To host it on your own:
1. Create a Heroku account
2. Create a Heroku project
3. Go to the 'Deploy' tab of the project and press 'Connect to GitHub'
4. Select your fork of this repository as the one to be deployed
5. It should be deployed at {heroku project name}.herokuapp.com

   Test it using a request like {heroku project name}.herokuapp.com/?subreddit=askreddit
### Frontend
The frontend is a `create-react-app` page hosted on GitHub pages. To host it on your own:
1. Go to the `client` folder

        cd client
2. Deploy to GitHub pages

        npm run deploy
    The command should commit the built React code to the `gh-pages` branch of the forked repository and enable GitHub pages.
    Note that the frontend will be accessing the server on https://redditpoetry.herokuapp.com
    
    You can change it to your own backend in the file `/client/src/App.js` in the function `getPoemJSON`.
