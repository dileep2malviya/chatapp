import multer, { StorageEngine } from "multer";
import { Request } from "express";
import path from "path";
import { checkImageExtenion, checkMimeTypes } from "../utils/commonvalidation.js";
import { ApiError } from "../utils/errorApi.js";

const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb
  ) => {
    cb(null, "./src/public/temp");
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    cb
  ) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    cb(null, filename);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
   const ext = path.extname(file.originalname).toLowerCase();
  console.log(ext)
  console.log(file.mimetype)
  console.log(checkImageExtenion(ext), checkMimeTypes(file.mimetype))
  if (checkImageExtenion(ext) && checkMimeTypes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Invalid file type", {error: "Only JPG, JPEG, and PNG files are allowed."}));
  }
}

export const upload = multer({
   storage,
   fileFilter,
   limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});