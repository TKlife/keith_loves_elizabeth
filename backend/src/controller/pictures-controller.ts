import { GetBucketLocationCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from 'crypto';
import { RequestHandler } from "express";
import imageThumbnail from 'image-thumbnail';
import sizeOf from 'image-size'
import sharp from 'sharp'

const s3 = new S3Client({})

const KEITH_LOVES_ELIZABETH_BUCKET_NAME = 'keithloveselizabeth'
const PICTURE_DIRECTORY = 'pictures'
const THUMBNAIL_DRECTORY = PICTURE_DIRECTORY + '/thumbnails' 

const addPictures: RequestHandler = async (req, res, next) => {
  try {
    if (req.files) {
      const files: Express.Multer.File[] = Object.values(req.files)
      for (const file of files) {
        const nameParts = file.originalname.split('.')
        let name;
        if (nameParts.length > 0) {
          nameParts.splice(nameParts.length - 1, 1)[0]
        }
        const size = sizeOf(file.buffer)
        console.log(size)
        const thumbNailParams: { responseType: "buffer" } & imageThumbnail.Options = { responseType: 'buffer'};
        if (size?.height && size?.width) {
          thumbNailParams.height = Math.floor(size.height * 0.2)
          thumbNailParams.width = Math.floor(size.width * 0.2)
          thumbNailParams.percentage = undefined
        }
        const orientation = await getImageOrientation(file.buffer)
        let resizeOptions: {width?: number, height?: number} = {}
        console.log(orientation)
        if (orientation === 'portrait') {
          resizeOptions.height = 500
        } else {
          resizeOptions.width = 500
        }
        const imageManip = sharp(file.buffer)
            .resize(resizeOptions)
            .autoOrient()
            .toFormat('jpeg')
        imageManip.toBuffer()
            .then(thumbnail => {
              name = `${nameParts.join('.')}_${crypto.randomBytes(12).toString('hex')}`
              s3.send(new PutObjectCommand({
                Bucket: KEITH_LOVES_ELIZABETH_BUCKET_NAME,
                Key: `${PICTURE_DIRECTORY}/${name}`,
                Body: file.buffer,
                ContentType: file.mimetype
              }))
              s3.send(new PutObjectCommand({
                Bucket: KEITH_LOVES_ELIZABETH_BUCKET_NAME,
                Key: `${THUMBNAIL_DRECTORY}/${name}`,
                Body: thumbnail,
                ContentType: file.mimetype
              }))
            })
      } 
    }
    res.status(200).json()
  } catch (error: any) {
    console.log(error)
    res.status(500).json(error)
  }
}

const getPictureThumbnails: RequestHandler = async (req, res, next) => {
  console.log(req.query['max'])
  const thumbnails = await s3.send(new ListObjectsV2Command({
    Bucket: KEITH_LOVES_ELIZABETH_BUCKET_NAME,
    Prefix: THUMBNAIL_DRECTORY,
    // MaxKeys: body.max,
    // StartAfter: body.startAfter
  }))
  const bucket = await s3.send(new GetBucketLocationCommand({
    Bucket: KEITH_LOVES_ELIZABETH_BUCKET_NAME
  }))
  console.log(bucket)
  const url = `https://${KEITH_LOVES_ELIZABETH_BUCKET_NAME}.s3.${bucket.LocationConstraint}.amazonaws.com`
  const urls: {url: string, thumbnailPath: string, picturePath: string}[] = []
  if (thumbnails?.Contents) {
    for (const thumbnail of thumbnails.Contents) {
      if (thumbnail.Key) {
        const pathParts = thumbnail.Key?.split('/')
        urls.push({url, thumbnailPath: thumbnail.Key, picturePath: `${pathParts[0]}/${pathParts[2]}`})
      }
    }
  }
  res.status(200).json(urls)
}

async function getImageOrientation(buffer: Buffer): Promise<'landscape' | 'portrait'> {
  const metaData = await sharp(buffer)
      .metadata()
  console.log(metaData)
  if (metaData.autoOrient.width > metaData.autoOrient.height) {
    return 'landscape'
  } else {
    return 'portrait'
  }
}

export {
  addPictures,
  getPictureThumbnails
};
