const express = require('express')
const config = require('config')
const mongoose = require('mongoose')

const app = express()

const PORT = config.get('port') || 5000

async function start() {
    try {
        await mongoose.connect(config.get('mongoUrl'),{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        app.listen(PORT, ()=> console.log(`App is started on port ${PORT}`))
    } catch (e) {
        console.log(`Server error `, e.message)
        process.exit(1)
    }
}

start()


