import { Request, Response, NextFunction } from 'express'
import { createHmac } from 'node:crypto'

export interface AuthRequest extends Request { userId?: string }
function b64(s:string){return Buffer.from(s).toString("base64url")}
function verify(token:string,secret:string){const [h,p,s]=token.split(".");if(!h||!p||!s)throw new Error("bad token");const sig=createHmac("sha256",secret).update(`${h}.${p}`).digest("base64url");if(sig!==s)throw new Error("bad signature");const payload=JSON.parse(Buffer.from(p,"base64url").toString());if(payload.exp<Date.now()/1000)throw new Error("expired");return payload}
export function authenticate(req:AuthRequest,res:Response,next:NextFunction){try{const secret=process.env.JWT_SECRET;if(!secret)return res.status(500).json({message:"JWT_SECRET is not configured on the server"});const header=req.headers.authorization;if(!header)return res.status(401).json({message:"Authentication required"});const [scheme,token]=header.split(" ");if(scheme!=="Bearer"||!token)return res.status(401).json({message:"Invalid authorization header"});const decoded=verify(token,secret);if(typeof decoded.userId!=="string")throw new Error("invalid");req.userId=decoded.userId;next()}catch{return res.status(401).json({message:"Invalid or expired token"})}}
