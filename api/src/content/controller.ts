import { RequestHandler } from 'express';
import * as content from './model';

export const createPost: RequestHandler = async (req, res) => {
  try {
    const { username, post, title, url, tags } = req.body;

    const newPost = (tags)
      ? await content.createPost(username, post, title, url, tags)
      : await content.createPost(username, post, title, url);
    res.status(200).json(newPost);
  } catch (err) {
    if (err.message === 'duplicate key value violates unique constraint "posts_url_key"') {
      res.status(400).json({ error: 'The URL already exists' });
    } else {
      res.status(400).json({ error: 'Something went wrong' });
    }
  }
};

export const getPost: RequestHandler = async (req, res) => {
  try {
    const { url } = req.params;
    const post = await content.getPost(url);
    res.status(200).json(post);
  } catch (err) {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

export const getUserPosts: RequestHandler = async (req, res) => {
  try {
    const { username, role } = res.locals;
    const { user, page } = req.params;
    const offset = (!page || Number(page) - 1 <= 0)
      ? 0
      : (Number(page) - 1) * 10;

    if (
      (role === 'admin' || role === 'mod')
      || ((role === 'user') && (user === username))
    ) {
      const post = await content.getUserPosts(user, offset);
      res.status(200).json(post);
    } else {
      res.status(403).json({ error: 'You are not authorized' });
    }
  } catch (err) {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

export const getPosts: RequestHandler = async (req, res) => {
  try {
    const { page, tag, year } = req.query;
    const fixedTag = (tag) ? tag as string : null;
    const fixedYear = (year) ? Number(year): null;
    const offset = (Number(page) - 1 <= 0)
      ? 0
      : (Number(page) - 1) * 10;

    const posts = await content.getPosts(offset, fixedTag, fixedYear);
    res.status(200).json(posts);
  } catch (err) {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

export const deletePost: RequestHandler = async (req, res) => {
  try {
    const { username, role } = res.locals;
    const { url } = req.body;

    await content.deletePost(username, role, url);
    res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Something went wrong' });
  }
};

export const editPost: RequestHandler = async (req, res) => {
  try {
    const { username, role } = res.locals;
    const { post, title, url, newUrl, tags } = req.body;

    await content.editPost(username, role, post, title, url, newUrl, tags);
    res.status(200).json({ message: 'Post updated' });
  } catch (err) {
    if (err.message === 'duplicate key value violates unique constraint "posts_url_key"') {
      res.status(400).json({ error: 'The URL already exists' });
    } else {
      res.status(400).json({ error: 'Something went wrong' });
    }
  }
};
