import jwt from 'jsonwebtoken';
import { decodeType } from '../types/user.types.js';

const scretKey:string  = process.env.ACCESS_TOKEN_SECRET ?? ""

const tokenDecode = (token: string): decodeType | null   => {
	if (!token) return null;

	try {
		const decoded = jwt.verify(token,scretKey) as { [key: string]: any };
		return decoded.data;
	} catch (err) {
		return null;
	}
}

export {
    tokenDecode
}
