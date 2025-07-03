import { RequestHandler } from "express";

const getHelpVideoUrl: RequestHandler = (req, res, next) => {
  console.log('Help Video')
  res.status(200).json({message: 'test'});
}

export {
  getHelpVideoUrl
}