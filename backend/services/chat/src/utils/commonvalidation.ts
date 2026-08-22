const allowedMimeTypes : string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const allowedExtensions : string[] = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

const checkImageExtenion = (filename:string): boolean => {
    const extensionName = filename.slice(filename.lastIndexOf('.')).toLowerCase();
    return allowedExtensions.includes(extensionName);
}

const checkMimeTypes = (filename:string): boolean => {
    return allowedMimeTypes.includes(filename);
}

export {
    checkImageExtenion,
    checkMimeTypes
}

