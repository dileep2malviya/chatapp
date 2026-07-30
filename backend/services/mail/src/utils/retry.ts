
const shouldRetry = (error: any) => {
    return [
        "ECONNECTION",
        "ETIMEDOUT",
        "ESOCKET",
    ].includes(error.code);
};

export {
    shouldRetry
}