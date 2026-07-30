interface MongoDuplicateKeyErrorTypes extends Error {
    code: number;
    keyPattern: Record<string, number>;
    keyValue: Record<string, unknown>;
}
export type {
    MongoDuplicateKeyErrorTypes
}