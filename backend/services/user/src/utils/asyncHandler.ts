import {
    type RequestHandler, 
    type Response,
    type Request,
    type NextFunction
} from 'express'

const asyncHandler = (handler: RequestHandler):RequestHandler => {
    return (req:Request, res: Response, next: NextFunction) => {
        Promise.resolve(handler(req, res, next)).catch(next)
    }
}

export {
    asyncHandler
}