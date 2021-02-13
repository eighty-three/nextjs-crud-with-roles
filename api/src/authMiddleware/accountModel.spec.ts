import * as account from './accountModel';
import { createAccount } from '../account/model';

describe('check username', () => {
  test('should fail because user doesnt exist', async () => {
    const user = await account.checkUsername('dummy');
    expect(user).toStrictEqual(null);
  });

  test('should work', async () => {
    await createAccount('dummy', '123');

    const user = await account.checkUsername('dummy');
    expect(user).toStrictEqual({ username: 'dummy' });
  });
});

describe('check usernames', () => {
  test('empty input', async () => {
    const usernames: [] = [];
    const check = await account.checkUsernames(usernames);
    expect(check).toBe(false);
  });

  test('one input true', async () => {
    await createAccount('dummy1', '123');

    const usernames = ['dummy1'];
    const check = await account.checkUsernames(usernames);
    expect(check).toBe(true);
  });

  test('one input false', async () => {
    const usernames = ['dummy2'];
    const check = await account.checkUsernames(usernames);
    expect(check).toBe(false);
  });

  test('multiple input one false', async () => {
    const usernames = ['dummy1', 'dummy2'];
    const check = await account.checkUsernames(usernames);
    expect(check).toBe(false);
  });

  test('multiple input all false', async () => {
    const usernames = ['dummy2', 'dummy3'];
    const check = await account.checkUsernames(usernames);
    expect(check).toBe(false);
  });

  test('multiple input all true', async () => {
    await createAccount('dummy2', '123');
    await createAccount('dummy3', '123');
    const usernames = ['dummy1', 'dummy2', 'dummy3'];
    const check = await account.checkUsernames(usernames);
    expect(check).toBe(true);
  });
});

describe('check password', () => {
  test('should fail because user doesnt exist', async () => {
    const user = await account.checkPassword('dummy4');
    expect(user).toStrictEqual(null);
  });

  test('should work', async () => {
    const user = await account.checkPassword('dummy');
    expect(user).toStrictEqual({ password: '123' });
  });
});
