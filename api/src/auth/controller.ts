import { RequestHandler } from 'express';
import config from '@utils/config';
import * as argon2 from 'argon2';
import { sign } from 'jsonwebtoken';
import cookie from 'cookie';
import * as account from '../account/model';

export const login: RequestHandler = async (req, res) => {
  try {
    const { username } = req.body;
    const data = await account.getRole(username);

    const claims = { username, role: data?.role };
    const authToken = sign(claims, config.SECRET_JWT, { expiresIn: '1d' });
    res.setHeader('Set-Cookie', cookie.serialize('auth', authToken, {
      httpOnly: true,
      secure: config.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/'
    }));

    res.status(200).json({ message: 'Cookie set' });
  } catch {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

export const signup: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await argon2.hash(password);
    await account.createAccount(username, hash);

    const claims = { username, role: 'new' };
    const authToken = sign(claims, config.SECRET_JWT, { expiresIn: '1d' });
    res.setHeader('Set-Cookie', cookie.serialize('auth', authToken, {
      httpOnly: true,
      secure: config.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/'
    }));

    res.status(200).json({ message: 'Cookie set' });
  } catch {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

export const logout: RequestHandler = async (req, res) => {
  const { message } = req.body;
  res.clearCookie('auth', { path: '/' });
  res.status(200).json({ message });
};
