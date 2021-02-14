import cookie from 'cookie';
import { verify } from 'jsonwebtoken';
const secret = process.env.SECRET;

const authCheck = async (ctx) => {
  const reqCookie = ctx.req.headers.cookie;
  if (!reqCookie) return null; // No token

  const cookies = cookie.parse(reqCookie);
  const payload = verify(cookies.auth, secret);
  if (!payload) return null; // Invalid token

  const { username, role } = payload;
  return { username, role };
};

export default authCheck;
