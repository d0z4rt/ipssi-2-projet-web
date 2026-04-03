import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import requestErrorHandler from './middlewares/requestErrorHandler.js'
import requestErrorLogger from './middlewares/requestErrorLogger.js'
import requestLogger from './middlewares/requestLogger.js'
import routes from './routes.js'

const app = express()

app.disable('etag')
app.disable('x-powered-by')

app.use(helmet())

// ! Enable cors, edit for production
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)
// app.use(
//   cors({
//     origin: true,
//     allowedHeaders:
//       'Origin, X-Requested-With, ' +
//       'Authorization, Content-Type, Accept, ' +
//       'Accept-Version, Content-Length, AcceptedLanguage, ' +
//       'Accept-Encoding, Accept-Language,' +
//       'x-auth-token, x-device-id',
//     methods: 'OPTIONS,GET,PUT,PATCH,POST,DELETE'
//   })
// )

app.use(express.json())

// Log all incoming requests
app.use(requestLogger)

// Register api routes
app.use(routes)

// Log errors during requests
app.use(requestErrorLogger)

// Global error handler
app.use(requestErrorHandler)

export default app
