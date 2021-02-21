import { RequestHandler } from 'express';
import config from '@utils/config';
import * as argon2 from 'argon2';
import { sign } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import * as account from '../account/model';
import * as auth from './model';

export const login: RequestHandler = async (req, res) => {
  try {
    const { username } = req.body;
    const role = await account.getRole(username);
    const session = await auth.getSession(username);

    const accessToken = sign(
      { username, role },
      config.SECRET_JWT,
      { expiresIn: 60 * 30 } // 30 minutes
    );

    res.cookie('access', accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 99999999,
      path: '/'
    });

    const refreshToken = sign(
      { username, role, session },
      config.SECRET_JWT,
      { expiresIn: 3600 * 24 * 7 } // 1 week
    );

    res.cookie('refresh', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 99999999,
      path: '/'
    });

    res.status(200).json({ message: 'Cookie set' });
  } catch {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

export const signup: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await argon2.hash(password);
    const session = nanoid(20);
    const role = 'new';
    await account.createAccount(username, hash, session, role);

    const accessToken = sign(
      { username, role },
      config.SECRET_JWT,
      { expiresIn: 60 * 30 } // 30 minutes
    );

    res.cookie('access', accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 99999999,
      path: '/'
    });

    const refreshToken = sign(
      { username, role, session },
      config.SECRET_JWT,
      { expiresIn: 3600 * 24 * 7 } // 1 week
    );

    res.cookie('refresh', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 99999999,
      path: '/'
    });

    res.status(200).json({ message: 'Cookie set' });
  } catch {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

export const logout: RequestHandler = async (req, res) => {
  const { message } = req.body;
  res.clearCookie('access', { path: '/' });
  res.clearCookie('refresh', { path: '/' });
  res.status(200).json({ message });
};
