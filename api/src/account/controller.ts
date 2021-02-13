import { RequestHandler } from 'express';
import config from '@utils/config';

import * as argon2 from 'argon2';
import { sign } from 'jsonwebtoken';
import cookie from 'cookie';

import * as account from './model';

export const login: RequestHandler = async (req, res) => {
  try {
    const { username } = req.body;
    const role = await account.getRole(username);

    const claims = { username, role };
    const authToken = sign(claims, config.SECRET_JWT, { expiresIn: '12h' });
    res.setHeader('Set-Cookie', cookie.serialize('auth', authToken, {
      httpOnly: true,
      secure: config.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 43200,
      path: '/'
    }));

    res.status(200).json({ message: 'Cookie set' });
  } catch {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

export const signup: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await argon2.hash(password);
    await account.createAccount(username, hash);

    const claims = { username, role: 'new' };
    const authToken = sign(claims, config.SECRET_JWT, { expiresIn: '12h' });
    res.setHeader('Set-Cookie', cookie.serialize('auth', authToken, {
      httpOnly: true,
      secure: config.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 43200,
      path: '/'
    }));

    res.status(200).json({ message: 'Cookie set' });
  } catch {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

export const logout: RequestHandler = async (req, res) => {
  const { message } = req.body;
  res.clearCookie('auth', { path: '/' });
  res.status(200).json({ message });
};

export const generateAccount: RequestHandler = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hash = await argon2.hash(password);
    await account.createAccount(username, hash, role);
    res.status(200).json({ message: 'Account successfully created' });
  } catch {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

export const updateAccount: RequestHandler = async (req, res) => {
  try {
    const { username, role } = req.body;
    await account.updateAccount(username, role);
    res.status(200).json({ message: 'Role successfully changed' });
  } catch {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

export const deleteAccount: RequestHandler = async (req, res) => {
  try {
    const { username } = req.body;
    await account.deleteAccount(username);
    res.status(200).json({ message: 'Account successfully deleted' });
  } catch {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

export const changePassword: RequestHandler = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const hash = await argon2.hash(newPassword);
    await account.changePassword(username, hash);
    res.status(200).json({ message: 'Password successfully changed' });
  } catch {
    res.status(400).json({ message: 'Something went wrong' });
  }
};
