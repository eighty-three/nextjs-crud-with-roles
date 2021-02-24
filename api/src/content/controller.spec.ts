import request from 'supertest';
import * as argon2 from 'argon2';
import http from 'http';
import app from '../app';
const server = http.createServer(app).listen(8090);
const url = '/api/content';

import * as account from '../account/model';
import * as content from './model';

console.log = function() {return;}; // Disable console.logs

afterAll(async () => {
  server.close();
});

describe('endpoints with authentication', () => {
  const agent = request.agent(server);
  const modAgent = request.agent(server);
  let cookie, modCookie;

  beforeAll(async () => {
    const hash = await argon2.hash('test');
    await account.createAccount('dummy', 'dummy', hash, 'test', 'user');
    await account.createAccount('mod', 'test', hash, 'test', 'mod');
    await modAgent
      .post('/api/auth/login')
      .send({
        username: 'mod',
        password: 'test'
      })
      .expect(200)
      .then((res) => {
        const cookies = res.header['set-cookie'][0].split(',')
          .map((item: string) => item.split(';')[0]);
        modCookie = cookies.join(';');
        return modCookie;
      });

    await agent
      .post('/api/auth/login')
      .send({
        username: 'dummy',
        password: 'test'
      })
      .expect(200)
      .then((res) => {
        const cookies = res.header['set-cookie'][0].split(',')
          .map((item: string) => item.split(';')[0]);
        cookie = cookies.join(';');
        return cookie;
      });

    await account.createAccount('dummyOther', 'test', 'test', 'test', 'user');
  });

  describe('createPost', () => {
    afterEach(async () => {
      await agent.post(`${url}/delete`).send({ url: 'testurl' });
      await content.deletePost('dummyOther', 'user', 'testurl2');
    });

    test('createPost without tags', async () => {
      expect(await content.getPosts(0, null, null)).toStrictEqual([]);

      const data = {
        username: 'dummy',
        post: 'testpost',
        title: 'testtitle',
        url: 'testurl'
      };

      const post = await agent.post(`${url}/create`).send(data);
      expect(post.body).toMatchObject({
        username: 'dummy',
        name: 'dummy',
        post: 'testpost',
        title: 'testtitle',
        url: 'testurl',
        tag_names: null
      });
      expect(post.status).toStrictEqual(200);
      expect(await content.getPosts(0, null, null)).toEqual(expect.arrayContaining(
        [expect.objectContaining({ post: 'testpost' })]
      ));
      expect(await content.getPosts(0, null, null)).toHaveLength(1);
    });

    test('createPost with conflicting url', async () => {
      expect(await content.getPosts(0, null, null)).toStrictEqual([]);
      await content.createPost('dummyOther', 'test', 'test', 'testurl2');

      const data = {
        username: 'dummy',
        post: 'testpost',
        title: 'testtitle',
        url: 'testurl2'
      };

      const post = await agent.post(`${url}/create`).send(data);
      expect(post.body).toStrictEqual({ error: 'The URL already exists' });
      expect(post.status).toStrictEqual(400);
    });

    test('createPost with tags', async () => {
      const data = {
        username: 'dummy',
        post: 'testpost',
        title: 'testtitle',
        url: 'testurl',
        tags: ['tag1', 'tag2']
      };

      const post = await agent.post(`${url}/create`).send(data);

      expect(post.body).toMatchObject({
        username: 'dummy',
        name: 'dummy',
        post: 'testpost',
        title: 'testtitle',
        url: 'testurl',
        tag_names: '{tag1,tag2}'
      });

      expect(post.status).toStrictEqual(200);

      expect(await content.getPosts(0, null, null)).toEqual(expect.arrayContaining(
        [expect.objectContaining({ post: 'testpost' })]
      ));

      expect(await content.getPosts(0, null, null)).toHaveLength(1);
    });
  });

  describe('getUserPosts', () => {
    beforeAll(async () => {
      for (let i=0; i < 25; i++) {
        await content.createPost('dummy', 'test', 'test', `testurl${i}_self`);
        await content.createPost('dummyOther', 'test', 'test', `testurl${i}_other`);
      }
    });

    afterAll(async () => {
      for (let i=0; i < 25; i++) {
        await content.deletePost('dummy', 'user', `testurl${i}_self`);
        await content.deletePost('dummyOther', 'user', `testurl${i}_other`);
      }
    });

    test('getUserPosts on self as user', async () => {
      const posts = await agent.get(`${url}/posts/dummy`);
      expect(posts.status).toStrictEqual(200);
      expect(posts.body).toEqual(expect.arrayContaining(
        [expect.objectContaining({ username: 'dummy' })]
      ));
    });

    test('getUserPosts on self as user test pagination', async () => {
      const posts = await agent.get(`${url}/posts/dummy/1`);
      expect(posts.status).toStrictEqual(200);
      expect(posts.body).toEqual(expect.arrayContaining(
        [expect.objectContaining({ username: 'dummy' })]
      ));
      expect(posts.body.length).toStrictEqual(21);

      const nextPage = await agent.get(`${url}/posts/dummy/2`);
      expect(nextPage.body.length).toStrictEqual(5);

      const noPage = await agent.get(`${url}/posts/dummy/3`);
      expect(noPage.body.length).toStrictEqual(0);
    });

    test('getUserPosts on others as user', async () => {
      const posts = await agent.get(`${url}/posts/dummyOther`);
      expect(posts.status).toStrictEqual(403);
      expect(posts.body).toStrictEqual({ error: 'You are not authorized' });
    });

    test('getUserPosts on others as mod', async () => {
      const posts = await modAgent.get(`${url}/posts/dummyOther`);
      expect(posts.status).toStrictEqual(200);
      expect(posts.body).toEqual(expect.arrayContaining(
        [expect.objectContaining({ username: 'dummyOther' })]
      ));
    });
  });

  describe('deletePost', () => {
    beforeAll(async () => {
      await content.createPost('dummy', 'post', 'testtitle', 'testurl');
      await content.createPost('dummyOther', 'post', 'testtitle', 'testurl2');
    });

    test('deletePost on own post', async () => {
      expect(await content.getPost('testurl')).toMatchObject({
        post: 'post',
        url: 'testurl',
        tag_names: null
      });

      const data = { url: 'testurl' };
      const post = await agent.post(`${url}/delete`).send(data);

      expect(await content.getPost('testurl')).toStrictEqual(null);

      expect(post.body).toMatchObject({ message: 'Post deleted' });
      expect(post.status).toStrictEqual(200);
    });

    test('deletePost on others\' post', async () => {
      expect(await content.getPost('testurl2')).toMatchObject({
        post: 'post',
        url: 'testurl2',
        tag_names: null
      });

      const data = { url: 'testurl2' };
      const post = await agent.post(`${url}/delete`).send(data);

      expect(await content.getPost('testurl2')).toMatchObject({ url: 'testurl2' });

      /* You can't delete others' post via the client.
       * This can only happen if a user deliberately tries sending
       * a request to the API trying to delete others' posts.
       * A success message is returned regardless as long as the
       * request schema is proper
       */
      expect(post.body).toMatchObject({ message: 'Post deleted' });
      expect(post.status).toStrictEqual(200);
    });

    test('deletePost on others\' post as mod', async () => {
      expect(await content.getPost('testurl2')).toMatchObject({
        post: 'post',
        url: 'testurl2',
        tag_names: null
      });

      const data = { url: 'testurl2' };
      const post = await modAgent.post(`${url}/delete`).send(data);

      expect(await content.getPost('testurl2')).toStrictEqual(null);
      expect(post.body).toMatchObject({ message: 'Post deleted' });
      expect(post.status).toStrictEqual(200);
    });
  });

  describe('editPost', () => {
    beforeAll(async () => {
      await content.createPost('dummy', 'test', 'test', 'testurl1');
      await content.createPost('dummy', 'test', 'test', 'testurl2', ['tag1', 'tag2']);
      await content.createPost('dummyOther', 'test', 'test', 'testurl3');
    });

    afterAll(async () => {
      await content.deletePost('dummy', 'user', 'testurl1');
      await content.deletePost('mod', 'mod', 'testurl2');
      await content.deletePost('mod', 'mod', 'testurl4');
      await content.deletePost('mod', 'mod', 'testurl99');
    });

    test('editPost on own post as user', async () => {
      expect(await content.getPost('testurl99')).toStrictEqual(null);
      const data = {
        post: 'testpost_edit',
        title: 'testtitle',
        url: 'testurl1',
        newUrl: 'testurl99'
      };

      const post = await agent.post(`${url}/edit`).send(data);
      expect(post.status).toStrictEqual(200);
      expect(post.body).toStrictEqual({ message: 'Post updated' });
      expect(await content.getPost('testurl1')).toStrictEqual(null);
      expect(await content.getPost('testurl99')).toMatchObject({
        username: 'dummy',
        name: 'dummy',
        post: 'testpost_edit',
        title: 'testtitle',
        url: 'testurl99',
        tag_names: null
      });
    });

    test('editPost on own post as user keep url the same', async () => {
      const data = {
        post: 'testpost_edit',
        title: 'testtitle',
        url: 'testurl2',
        newUrl: 'testurl2',
        tags: ['tag1', 'tag2']
      };

      const post = await agent.post(`${url}/edit`).send(data);
      expect(post.status).toStrictEqual(200);
      expect(post.body).toStrictEqual({ message: 'Post updated' });
      expect(await content.getPost('testurl2')).toMatchObject({
        username: 'dummy',
        name: 'dummy',
        post: 'testpost_edit',
        title: 'testtitle',
        url: 'testurl2',
      });
    });

    test('editPost on own post as user on nonexistent url', async () => {
      expect(await content.getPost('not_a_url')).toStrictEqual(null);
      expect(await content.getPost('a_url')).toStrictEqual(null);

      const data = {
        post: 'testpost_edit',
        title: 'testtitle',
        url: 'not_a_url',
        newUrl: 'a_url'
      };

      const post = await agent.post(`${url}/edit`).send(data);
      expect(post.status).toStrictEqual(200);
      expect(post.body).toStrictEqual({ message: 'Post updated' });
      expect(await content.getPost('not_a_url')).toStrictEqual(null);
      expect(await content.getPost('a_url')).toStrictEqual(null);
    });

    test('editPost on own post as user adding tags', async () => {
      expect(await content.getPost('testurl2')).toMatchObject({
        url: 'testurl2',
        tag_names: '{tag1,tag2}'
      });

      const data = {
        post: 'testpost_edit',
        title: 'testtitle',
        url: 'testurl2',
        newUrl: 'testurl2',
        tags: ['tag1', 'tag2', 'tag3']
      };

      const post = await agent.post(`${url}/edit`).send(data);
      expect(post.status).toStrictEqual(200);
      expect(post.body).toStrictEqual({ message: 'Post updated' });
      expect(await content.getPost('testurl2')).toMatchObject({
        url: 'testurl2',
        tag_names: '{tag1,tag2,tag3}'
      });
    });

    test('editPost on own post as user deleting tags', async () => {
      expect(await content.getPost('testurl2')).toMatchObject({
        url: 'testurl2',
        tag_names: '{tag1,tag2,tag3}'
      });

      const data = {
        post: 'testpost_edit',
        title: 'testtitle',
        url: 'testurl2',
        newUrl: 'testurl2'
      };

      const post = await agent.post(`${url}/edit`).send(data);
      expect(post.status).toStrictEqual(200);
      expect(post.body).toStrictEqual({ message: 'Post updated' });
      expect(await content.getPost('testurl2')).toMatchObject({
        url: 'testurl2',
        /* If the sent tags data is empty or outright excluded,
         * the tags column of the post is set to {}, which would
         * return null
         */
        tag_names: null
      });
    });

    test('editPost on other post as user', async () => {
      const data = {
        post: 'testpost_edit',
        title: 'testtitle',
        url: 'testurl3',
        newUrl: 'testurl4'
      };

      const post = await agent.post(`${url}/edit`).send(data);

      // Similar to deletePost, where no changes to the database are made
      expect(post.status).toStrictEqual(200);
      expect(post.body).toStrictEqual({ message: 'Post updated' });
      expect(await content.getPost('testurl4')).toStrictEqual(null);
      expect(await content.getPost('testurl3')).toMatchObject({
        url: 'testurl3'
      });
    });

    test('editPost on other post as mod', async () => {
      const data = {
        post: 'testpost_edit',
        title: 'testtitle',
        url: 'testurl3',
        newUrl: 'testurl4'
      };

      const post = await modAgent.post(`${url}/edit`).send(data);

      // Similar to deletePost, where no changes to the database are made
      expect(post.status).toStrictEqual(200);
      expect(post.body).toStrictEqual({ message: 'Post updated' });
      expect(await content.getPost('testurl3')).toStrictEqual(null);
      expect(await content.getPost('testurl4')).toMatchObject({
        url: 'testurl4'
      });
    });
  });
});

describe('createPost', () => {
  const agent = request(server);

  beforeAll(async () => {
    await account.createAccount('dummy_createPost', 'test', 'test', 'test', 'user');
  });

  test('null data', async () => {
    const data = {};
    const post = await agent.post(`${url}/create`).send(data);

    expect(post.body).toMatchObject({ error: 'Bad Request' });
    expect(post.status).toStrictEqual(400);
  });

  test('incomplete fields', async () => {
    const data = { username: 'dummy' };
    const post = await agent.post(`${url}/create`).send(data);

    expect(post.body).toMatchObject({ error: 'Bad Request' });
    expect(post.status).toStrictEqual(400);
  });

  test('invalid fields', async () => {
    const data = { username: 'dummy', password: 'test' };
    const post = await agent.post(`${url}/create`).send(data);

    expect(post.body).toMatchObject({ error: 'Bad Request' });
    expect(post.status).toStrictEqual(400);
  });

  test('invalid values', async () => {
    const data = {
      username: 'dummy',
      post: 'testpost',
      title: 'testtitle',
      url: 1000
    };

    const post = await agent.post(`${url}/create`).send(data);

    expect(post.body).toMatchObject({ error: 'Bad Request' });
    expect(post.status).toStrictEqual(400);
  });

  test('valid request, no auth', async () => {
    const data = {
      username: 'dummy',
      post: 'testpost',
      title: 'testtitle',
      url: 'testurl'
    };

    const post = await agent.post(`${url}/create`).send(data);

    expect(post.body).toMatchObject({ error: 'You are not authenticated' });
    expect(post.status).toStrictEqual(401);
  });
});

describe('deletePost', () => {
  const agent = request(server);

  beforeAll(async () => {
    await account.createAccount('dummy_deletePost', 'test', 'test', 'test', 'user');
    await content.createPost('dummy_deletePost', 'test', 'test', 'deletePostUrl');
  });

  afterAll(async () => {
    await content.deletePost('dummy_deletePost', 'user', 'deletePostUrl');
  });

  test('null data', async () => {
    const data = {};
    const post = await agent.post(`${url}/delete`).send(data);

    expect(post.body).toMatchObject({ error: 'Bad Request' });
    expect(post.status).toStrictEqual(400);
  });

  test('invalid fields', async () => {
    const data = { password: 'test' };
    const post = await agent.post(`${url}/delete`).send(data);

    expect(post.body).toMatchObject({ error: 'Bad Request' });
    expect(post.status).toStrictEqual(400);
  });

  test('invalid values', async () => {
    const data = { url: 1000 };

    const post = await agent.post(`${url}/delete`).send(data);

    expect(post.body).toMatchObject({ error: 'Bad Request' });
    expect(post.status).toStrictEqual(400);
  });

  test('valid request, no auth', async () => {
    const data = { url: 'deletePostUrl' };

    const post = await agent.post(`${url}/delete`).send(data);

    expect(post.body).toMatchObject({ error: 'You are not authenticated' });
    expect(post.status).toStrictEqual(401);
  });
});

describe('editPost', () => {
  const agent = request(server);

  beforeAll(async () => {
    await account.createAccount('dummy_editPost', 'test', 'test', 'test', 'user');
    await content.createPost('dummy_editPost', 'test', 'test', 'editPostUrl');
  });

  afterAll(async () => {
    await content.deletePost('dummy_editPost', 'user', 'editPostUrl');
  });

  test('null data', async () => {
    const data = {};
    const post = await agent.post(`${url}/edit`).send(data);

    expect(post.body).toMatchObject({ error: 'Bad Request' });
    expect(post.status).toStrictEqual(400);
  });

  test('incomplete fields', async () => {
    const data = { post: 'dummy' };
    const post = await agent.post(`${url}/edit`).send(data);

    expect(post.body).toMatchObject({ error: 'Bad Request' });
    expect(post.status).toStrictEqual(400);
  });

  test('invalid fields', async () => {
    const data = { post: 'dummy', password: 'test' };
    const post = await agent.post(`${url}/edit`).send(data);

    expect(post.body).toMatchObject({ error: 'Bad Request' });
    expect(post.status).toStrictEqual(400);
  });

  test('invalid values', async () => {
    const data = {
      post: 'testpost',
      title: 'testtitle',
      url: 1000,
      newUrl: 'testurl'
    };

    const post = await agent.post(`${url}/edit`).send(data);

    expect(post.body).toMatchObject({ error: 'Bad Request' });
    expect(post.status).toStrictEqual(400);
  });

  test('valid request, no auth', async () => {
    const data = {
      post: 'testpost',
      title: 'testtitle',
      url: 'testurl',
      newUrl: 'testurl'
    };

    const post = await agent.post(`${url}/edit`).send(data);

    expect(post.body).toMatchObject({ error: 'You are not authenticated' });
    expect(post.status).toStrictEqual(401);
  });
});

describe('getUserPosts', () => {
  const agent = request(server);

  test('invalid values', async () => {
    const posts = await agent.get(`${url}/posts/dummy/9999999`);
    expect(posts.status).toStrictEqual(400);
    expect(posts.body).toMatchObject({ error: 'Bad Request' });
  });

  test('valid request, no auth', async () => {
    const posts = await agent.get(`${url}/posts/dummy/1`);
    expect(posts.status).toStrictEqual(401);
    expect(posts.body).toMatchObject({ error: 'You are not authenticated' });
  });
});

describe('getPost', () => {
  const agent = request(server);

  beforeAll(async () => {
    await account.createAccount('dummy_getPost', 'test', 'test', 'test', 'user');
    await content.createPost('dummy_getPost', 'test', 'test', 'getPostUrl');
  });

  afterAll(async () => {
    await content.deletePost('dummy_getPost', 'user', 'getPostUrl');
  });

  test('null data', async () => {
    const post = await agent.get(`${url}/post`);
    expect(post.status).toStrictEqual(404);
    expect(post.body).toMatchObject({ error: 'unknown endpoint' });
  });

  test('invalid values', async () => {
    const char51 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const post = await agent.get(`${url}/post/${char51}`);
    expect(post.status).toStrictEqual(400);
    expect(post.body).toMatchObject({ error: 'Bad Request' });
  });

  test('valid request, nonexistent url', async () => {
    const post = await agent.get(`${url}/post/not_a_url`);
    expect(post.status).toStrictEqual(200);
    expect(post.body).toStrictEqual(null);
  });

  test('valid request, works', async () => {
    const post = await agent.get(`${url}/post/getPostUrl`);
    expect(post.status).toStrictEqual(200);
    expect(post.body).toMatchObject({ url: 'getPostUrl' });
  });
});

describe('getPosts', () => {
  const agent = request(server);
  const currentYear = new Date().getFullYear();

  beforeAll(async () => {
    await account.createAccount('dummy_getPosts', 'test', 'test', 'test', 'user');
    for (let i=0; i < 13; i++) {
      await content.createPost('dummy_getPosts', 'test', 'test', `getPosts_${i}`, ['tag']);
    }
  });

  afterAll(async () => {
    for (let i=0; i < 13; i++) {
      await content.deletePost('dummy_getPosts', 'user', `getPosts_${i}`);
    }
  });

  test('null data', async () => {
    const data = {};
    const posts = await agent.get(`${url}/posts`).query(data);
    expect(posts.status).toStrictEqual(200);
  });

  test('incomplete fields', async () => {
    const data = { page: 1 };
    const posts = await agent.get(`${url}/posts`).query(data);
    expect(posts.status).toStrictEqual(200);
  });

  test('invalid fields', async () => {
    const data = { page: 1, password: 123 };
    const posts = await agent.get(`${url}/posts`).query(data);
    expect(posts.status).toStrictEqual(400);
    expect(posts.body).toMatchObject({ error: 'Bad Request' });
  });

  test('invalid values', async () => {
    const data = { page: 1, tag: 'tag', year: 2019 };
    const posts = await agent.get(`${url}/posts`).query(data);
    expect(posts.status).toStrictEqual(400);
    expect(posts.body).toMatchObject({ error: 'Bad Request' });
  });

  test('valid request, works', async () => {
    const data = { page: 1, tag: 'tag', year: 2021 };
    const posts = await agent.get(`${url}/posts`).query(data);
    expect(posts.status).toStrictEqual(200);
  });

  test('pagination', async () => {
    const data = { page: 1 };
    const posts = await agent.get(`${url}/posts`).query(data);
    expect(posts.status).toStrictEqual(200);
    expect(posts.body.length).toStrictEqual(13);

    const nextPage = await agent.get(`${url}/posts`).query({ page: 2 });
    expect(nextPage.body.length).toStrictEqual(1);
  });

  test('year + tag', async () => {
    const data = { page: 1, tag: 'tag', year: currentYear };
    const posts = await agent.get(`${url}/posts`).query(data);
    expect(posts.status).toStrictEqual(200);
    expect(posts.body.length).toStrictEqual(13);
  });

  test('year + tag on nonexistent tag', async () => {
    const data = { page: 1, tag: 'tag2', year: currentYear };
    const posts = await agent.get(`${url}/posts`).query(data);
    expect(posts.status).toStrictEqual(200);
    expect(posts.body.length).toStrictEqual(0);
  });

  test('year + tag on nonexistent year', async () => {
    const data = { page: 1, tag: 'tag', year: currentYear + 10 };
    const posts = await agent.get(`${url}/posts`).query(data);
    expect(posts.status).toStrictEqual(200);
    expect(posts.body.length).toStrictEqual(0);
  });

  test('!year + tag', async () => {
    const data = { page: 1, tag: 'tag' };
    const posts = await agent.get(`${url}/posts`).query(data);
    expect(posts.status).toStrictEqual(200);
    expect(posts.body.length).toStrictEqual(13);
  });

  test('year + !tag', async () => {
    const data = { page: 1, year: currentYear };
    const posts = await agent.get(`${url}/posts`).query(data);
    expect(posts.status).toStrictEqual(200);
    expect(posts.body.length).toStrictEqual(13);
  });

  test('!year + !tag', async () => {
    const data = { page: 1 };
    const posts = await agent.get(`${url}/posts`).query(data);
    expect(posts.status).toStrictEqual(200);
    expect(posts.body.length).toStrictEqual(13);
  });
});
