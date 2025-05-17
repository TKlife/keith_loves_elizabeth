import express, { Application } from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import { IncomingMessage, ServerResponse } from 'http'

const app: Application = express()
const zolaRoutes = new Set<string>(['faq', 'travel', 'rsvp', 'photo'])
const customRoutes = new Set<string>(['pictures'])

process.env.ENVIRONMENT === 'development'

app.use(bodyParser.json());
app.use((req, res, next) => {
  setResponseHeaders(req, res)
  next();
})


app.use('/assets', express.static(path.join('backend/assets')));
app.use('/resource', express.static(path.join(__dirname, "www")))
app.use('/event', express.static(path.join(__dirname, "www")))
app.use((req, res, next) => {
  const requestPath = req.path
  const parts = getPathParts(requestPath)
  console.log(parts)
  if (parts[0] === 'event' && customRoutes.has(parts[1])) {
    console.log('event')
    res.sendFile(path.join(__dirname, "www", "index.html"))
  } else {
    const fullPath = parts.join('/')
    console.log('redirect: ' + fullPath)
    if (zolaRoutes.has(fullPath)) {
      res.redirect('https://www.zola.com/wedding/keithloveselizabeth/' + fullPath)
    } else {
      res.redirect('https://www.zola.com/wedding/keithloveselizabeth')
    }
  }
})

export { app }

function getPathParts(path: string) {
  return path.split('/').filter(s => s)
}

function setResponseHeaders(req: IncomingMessage, res: ServerResponse) {
  let origin = 'https://www.keithloveselizabeth.com'
  if (process.env.ENVIRONMENT === 'development') {
    origin = 'http://localhost:4200'
  } else if (req.headers.origin === 'https://www.keithloveselizabeth.com') {
    origin = 'https://www.keithloveselizabeth.com'
  }
  // console.log(origin)
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  res.setHeader(
    'Access-Control-Allow-Methods',
    'Get, POST, PATCH, PUT, DELETE, OPTIONS'
  )
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=300; preload'
  )
  res.setHeader(
    'X-Frame-Options',
    'deny'
  )
  res.setHeader(
    'X-Content-Type-Options',
    'nosniff'
  )
  res.setHeader(
    'Referrer-Policy',
    'strict-origin'
  )
}