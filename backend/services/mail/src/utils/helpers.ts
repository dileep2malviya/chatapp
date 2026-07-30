const now = new Date();

const currentDate = now.toLocaleDateString("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const currentTime = now.toLocaleTimeString("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

export {
    currentDate,
    currentTime
}