import { RequestHandler } from 'express';
import * as argon2 from 'argon2';
import * as account from './model';

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

export const changeRole: RequestHandler = async (req, res) => {
  try {
    const { username, role } = req.body;
    await account.changeRole(username, role);
    res.status(200).json({ message: 'Role successfully changed' });
  } catch {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

