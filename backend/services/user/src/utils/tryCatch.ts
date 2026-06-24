import {
    type RequestHandler, 
    type Response,
    type Request,
    type NextFunction
} from 'express'

const TryCatch = (handler: RequestHandler):RequestHandler => {
    return async(req:Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next)
        } catch (error:unknown) {
            console.log("error :: ",error)
            next(error)
            // res.status(500).json({error: error})
        }
    }
}

export {
    TryCatch
}