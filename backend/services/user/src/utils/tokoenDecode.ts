import jwt from 'jsonwebtoken';
import { decodeType } from '../types/user.types.js';
import { ApiError } from './errorApi.js';

const scretKey:string = process.env.ACCESS_TOKEN_SECRET ?? ""

const tokenDecode = async (token: string): Promise<decodeType | null | unknown> => {
	if (!token) return null;

	try {
		const decoded = await jwt.verify(token,scretKey) as { [key: string]: any };
		return decoded.data;
	} catch (err) {
		console.error('Error decoding token:', err);
		throw new ApiError(401, 'Unauthorized access', err as Record<string, string>);
	}
}

export {
    tokenDecode
}
