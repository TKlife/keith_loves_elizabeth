import express from 'express'
import { getHelpVideoUrl } from '../controller/help-controller'

const router = express.Router()

router.get('/airport-video', getHelpVideoUrl)

export {
  router as helpRoutes
}