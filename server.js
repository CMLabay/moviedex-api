require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const MOVIES = require('./movies-data-small.json')
const cors = require('cors')

const app = express()

app.use(morgan('dev'))
app.use(cors())
app.use(helmet())

app.use((function validateBearerToken(req, res, next){
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
    console.log('validate bearer token middleware')
    if(!authToken || authToken.split(' ')[1] !== apiToken){
        return res.status(401).json({ error: 'Unauthorized request'})
    }
    //move to the next
    next()
}));


//1. The endpoint is GET /movie
//2. The search options for either name or type are provided in query string parameters.
//3. When searching by genre, users are searching for whether the Movie's genre includes a specified string. The search should be case insensitive.
//4. When searching by country, users are searching for whether the Movie's country includes a specified string. The search should be case insensitive.
//5. When searching by average vote, users are searching for Movies with an avg_vote that is greater than or equal to the supplied number.
//6. The API responds with an array of full movie entries for the search results

function handleGetMovies(req, res){
    const { genre, country, avg_vote} = req.query;
    let results = MOVIES;

    if(genre){
        results = results.filter(movies =>
            movies.genre.toLowerCase().includes(genre.toLowerCase())
        )
    }
    if(country){
        results = results.filter(movies =>
            movies.country.toLowerCase().includes(country.toLowerCase())
        )
    }
    if(avg_vote){
        results = results.filter(movies =>
            Number(movies.avg_vote) >= Number(avg_vote)
        )
    }
    res.json(results)
}

app.get('/movies', handleGetMovies)

const PORT = 8000

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})
