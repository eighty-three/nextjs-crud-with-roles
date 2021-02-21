import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';

export const getSession = async (
  username: string
): Promise<string|null> => {
  const query = new PS({ name: 'get-session', text: '\
    SELECT session FROM accounts\
    WHERE username=$1'
  });

  query.values = [username];
  const data = await db.oneOrNone(query);
  return data.session;
};

export const setSession = async (
  username: string,
  session: string
): Promise<void> => {
  const query = new PS({ name: 'set-session', text: '\
    UPDATE accounts SET session=$2\
    WHERE username=$1'
  });

  query.values = [username, session];
  await db.none(query);
};
