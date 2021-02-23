import { RequestHandler } from 'express';
import * as argon2 from 'argon2';
import { nanoid } from 'nanoid';
import * as account from './model';
import * as auth from '../auth/model';

export const generateAccount: RequestHandler = async (req, res) => {
  try {
    const { username, name, password, role } = req.body;
    const hash = await argon2.hash(password);
    const session = nanoid(20);
    await account.createAccount(username, name, hash, session, role);
    res.status(200).json({ message: 'Account successfully created' });
  } catch {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

export const deleteAccount: RequestHandler = async (req, res) => {
  try {
    const { username } = req.body;
    await account.deleteAccount(username);
    res.status(200).json({ message: 'Account successfully deleted' });
  } catch {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

export const getAccounts: RequestHandler = async (req, res) => {
  try {
    const accounts = await account.getAccounts();
    res.status(200).json({ accounts });
  } catch {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

export const changePassword: RequestHandler = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const hash = await argon2.hash(newPassword);
    await account.changePassword(username, hash);
    await auth.setSession(username, nanoid(20));
    res.status(200).json({ message: 'Password successfully changed' });
  } catch {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

export const setPassword: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await argon2.hash(password);
    await account.changePassword(username, hash);
    await auth.setSession(username, nanoid(20));
    res.status(200).json({ message: 'Password successfully changed' });
  } catch {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

export const changeRole: RequestHandler = async (req, res) => {
  try {
    const { username, role } = req.body;
    await account.changeRole(username, role);
    res.status(200).json({ message: 'Role successfully changed' });
  } catch {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

