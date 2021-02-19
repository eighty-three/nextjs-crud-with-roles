import ky from 'ky-universal';
import HOST from './host';
const api = `${HOST}/api/account`;

export const getAccounts = async (ctx) => {
  try {
    const headers = (ctx) ? ctx.req.headers : null;
    const customGet = ky.create({ headers });

    const req = await customGet.get(`${api}/list`);
    const response = await req.json();
    return response.accounts;
  } catch (err) {
    return { error: 'Something went wrong' };
  }
};

export const deleteAccount = async (username) => {
  try {
    const req = await ky.post(
      `${api}/delete`,
      { json: { username }, throwHttpErrors: false }
    );

    const response = await req.json();
    return response;
  } catch (err) {
    return { error: 'Something went wrong' };
  }
};

export const setPassword = async (username, password) => {
  try {
    const req = await ky.post(
      `${api}/setPassword`,
      { json: { username, password }, throwHttpErrors: false }
    );

    const response = await req.json();
    return response;
  } catch (err) {
    return { error: 'Something went wrong' };
  }
};

export const changeRole = async (username, role) => {
  try {
    const req = await ky.post(
      `${api}/changeRole`,
      { json: { username, role }, throwHttpErrors: false }
    );

    const response = await req.json();
    return response;
  } catch (err) {
    return { error: 'Something went wrong' };
  }
};
