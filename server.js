require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const MOVIES = require('./movies-data-small.json')
const cors = require('cors')

const app = express()

const mogranSetting = process.send.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(cors())
app.use(helmet())

app.use((function validateBearerToken(req, res, next){
    const apiToken = process.env.API_TOKEN
    let authToken = req.get('Authorization')
    if(authToken.split(' ')[0] == 'Bearer'){
        authToken = authToken.split(' ')[1];
    }
    if(!authToken || authToken !== apiToken){
        return res.status(401).json({ error: 'Unauthorized request'})
    }
    //move to the next
    next()
}));

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

app.get('/movie', handleGetMovies)

app.use((error, req, res, next) => {
    let response
    if(process.env.NODE_ENV === 'production'){
        response = { error: { message: 'server error' }}
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

const PORT = process.send.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})
