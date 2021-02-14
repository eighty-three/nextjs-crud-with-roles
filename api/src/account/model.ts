import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';

export const createAccount = async (
  username: string,
  hash: string,
  role = 'user'
): Promise<void> => {
  const query = new PS({ name: 'create-account', text: '\
    INSERT INTO accounts (username, password, role) VALUES ($1, $2, $3)'
  });

  query.values = [username, hash, role];
  await db.none(query);
};

export const deleteAccount = async (
  username: string
): Promise<void> => {
  const query = new PS({ name: 'delete-account', text: '\
    DELETE FROM accounts WHERE name=$1'
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
): Promise<string|void> => {
  const query = new PS({ name: 'get-role', text: '\
    SELECT role FROM accounts WHERE username=$1'
  });

  query.values = [username];
  await db.oneOrNone(query);
};

export const changeRole = async (
  username: string,
  role: string
): Promise<void> => {
  const query = new PS({ name: 'change-role', text: '\
    UPDATE accounts SET role=$1 WHERE name=$2'
  });

  query.values = [role, username];
  await db.none(query);
};
