import { RequestHandler } from 'express';
import config from '@utils/config';
import { verify } from 'jsonwebtoken';
import cookie from 'cookie';

interface IPayload {
  username?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export const verifyToken: RequestHandler = async (req, res, next) => {
  if (!req.headers.cookie) {
    res.status(401).json({ error: 'You are not authenticated' });
    return;
  }

  const cookies = cookie.parse(req.headers.cookie);
  verify(cookies.auth, config.SECRET_JWT, async function (err, decoded: IPayload|undefined) {
    if (err && !decoded) {
      res.status(401).json({ error: 'You are not authenticated' });
      return;
    } else if (decoded) {
      next();
      return;
    }
  });
};

export const verifyRole = (roles: string[]): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (!req.headers.cookie) {
        res.status(401).json({ error: 'You are not authenticated' });
        return;
      }

      const cookies = cookie.parse(req.headers.cookie);
      verify(cookies.auth, config.SECRET_JWT, async function (err, decoded: IPayload|undefined) {
        if (err && !decoded) {
          res.status(401).json({ error: 'You are not authenticated' });
          return;
        } else if (decoded) {
          const role = decoded.role as string;
          if (!roles.includes(role)) {
            res.status(401).json({ error: 'You are not authenticated' });
            return;
          }
        }
      });
      next();
      return;
    } catch {
      res.status(400).json({ error: 'Something went wrong' });
    }
  };
};

export const verifyExistingToken: RequestHandler = async (req, res, next) => {
  if (!req.headers.cookie) {
    next();
    return;
  } else {
    const cookies = cookie.parse(req.headers.cookie);
    verify(cookies.auth, config.SECRET_JWT, async function (err, decoded) {
      if (err && !decoded) {
        next();
        return;
      }
    });
  }

  res.status(400).json({ error: 'Already logged in' });
};

export const getUsername = async (reqCookie: string|null): Promise<string|void> => {
  if (!reqCookie) return;

  let username: string | undefined;
  const cookies = cookie.parse(reqCookie);

  verify(cookies.auth, config.SECRET_JWT, async function (err, decoded: IPayload|undefined) {
    if (err && !decoded) {
      return;
    } else if (decoded) {
      username = decoded.username as string;
    }
  });

  return username;
};
