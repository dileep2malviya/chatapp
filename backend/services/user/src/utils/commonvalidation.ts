const reservedUsernames: string[] = [
  "admin",
  "root",
  "system",
  "support",
  "login",
  "logout",
  "register",
  "api",
  "settings",
  "help",
  "about",
  "contact",
  "privacy",
  "terms",
  "administrator",
  "moderator",
  "owner",
  "staff",
  "noreply",
  "mail",
  "webmaster",
];

const allowedExtensions = ['.jpg', '.jpeg', '.png'];

const isReservedUsername = (username: string): boolean => {
    return reservedUsernames.includes(username.toLowerCase());
}

const checkImageExtenion = (filename:string): boolean => {
    const extensionName = filename.slice(filename.lastIndexOf('.')).toLowerCase();
    return allowedExtensions.includes(extensionName);
}

export {
    isReservedUsername,
    checkImageExtenion
}

