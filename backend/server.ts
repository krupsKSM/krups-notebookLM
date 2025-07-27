import dotenv from 'dotenv'
dotenv.config()

import http from 'http'
import app from './src/app'

const PORT = process.env.PORT || 5000

const server = http.createServer(app)

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
