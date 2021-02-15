import cookie from 'cookie';
import { verify } from 'jsonwebtoken';
const secret = process.env.SECRET;

const authCheck = async (ctx) => {
  const noAuth = { username: null, role: null };

  const reqCookie = ctx.req.headers.cookie;
  if (!reqCookie) return noAuth; // No token

  const cookies = cookie.parse(reqCookie);
  const payload = verify(cookies.auth, secret);
  if (!payload) return noAuth; // Invalid token

  const { username, role } = payload;
  return (username && role) ? { username, role } : noAuth;
};

export default authCheck;
