import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';
import { IUser } from './types';

export const createAccount = async (
  username: string,
  hash: string,
  session: string,
  role: string
): Promise<void> => {
  const query = new PS({ name: 'create-account', text: '\
    INSERT INTO accounts (username, password, session, role)\
    VALUES ($1, $2, $3, $4)'
  });

  query.values = [username, hash, session, role];
  await db.none(query);
};

export const getAccounts = async (
): Promise<IUser[]|null> => {
  const query = new PS({ name: 'get-accounts', text: '\
    SELECT username, role FROM accounts \
    ORDER BY date asc'
  });

  return await db.manyOrNone(query);
};

export const deleteAccount = async (
  username: string
): Promise<void> => {
  const query = new PS({ name: 'delete-account', text: '\
    DELETE FROM accounts WHERE username=$1'
  });

  query.values = [username];
  await db.none(query);
};

export const changePassword = async (
  username: string,
  hash: string
): Promise<void> => {
  const query = new PS({ name: 'change-password', text: '\
    UPDATE accounts SET password=$1 WHERE username=$2'
  });

  query.values = [hash, username];
  await db.none(query);
};

export const getRole = async (
  username: string
): Promise<string|null> => {
  const query = new PS({ name: 'get-role', text: '\
    SELECT role FROM accounts WHERE username=$1'
  });

  query.values = [username];
  const data = await db.oneOrNone(query);
  return data.role;
};

export const changeRole = async (
  username: string,
  role: string
): Promise<void> => {
  const query = new PS({ name: 'change-role', text: '\
    UPDATE accounts SET role=$1 WHERE username=$2'
  });

  query.values = [role, username];
  await db.none(query);
};
