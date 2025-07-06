import express from 'express'
import { addPictures, getLandingPictures, getPictureThumbnails } from '../controller/pictures-controller'
import multer from 'multer'

const storage = multer.memoryStorage()

const router = express.Router()

router.post('/upload', multer({storage}).array('images'), addPictures)

router.get('', multer({storage}).array('images'), getPictureThumbnails)

router.get('/landing', multer({storage}).array('images'), getLandingPictures)

export {
  router as pictureRoutes
}