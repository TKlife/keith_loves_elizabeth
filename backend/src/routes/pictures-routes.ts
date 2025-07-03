import express from 'express'
import { addPictures, getPictureThumbnails } from '../controller/pictures-controller'
import multer from 'multer'

const storage = multer.memoryStorage()

const router = express.Router()

router.post('/upload', multer({storage}).array('images'), addPictures)

router.get('/thumbnails', multer({storage}).array('images'), getPictureThumbnails)

export {
  router as pictureRoutes
}