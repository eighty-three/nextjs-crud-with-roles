import db from '@utils/db';
import { PreparedStatement as PS, QueryParam } from 'pg-promise';
import { IPost } from './types';

export const createPost = async (
  username: string,
  post: string,
  title: string,
  url: string,
  tags?: string[]
): Promise<IPost> => {
  return await db.tx(async t => {
    const tempArr = (tags) ? tags.slice() : [];
    const tag_ids = (tempArr.length)
      ? (await t.batch(
        tempArr.map((tag) => t.one(createTagQuery(tag)))
      )).map((obj) => Number(obj.tag_id))
      : [];

    const createPost = new PS({ name: 'create-post', text: '\
      WITH ins (user_id, post_id, post, title, url, tags, date) AS ( \
        INSERT INTO posts (user_id, post, title, url, tags) \
        VALUES ((SELECT user_id FROM accounts WHERE username=$1), $2, $3, $4, $5) \
        RETURNING user_id, post_id, post, title, url, tags, date \
      ) \
      SELECT TO_CHAR(ins.date, \'Mon DD, YYYY - HH24:MI:SS\') date,\
        post_id, post, title, url, a.username, a.name, t.tag_names FROM ins \
      INNER JOIN accounts a on a.user_id = ins.user_id\
      INNER JOIN (\
        SELECT array_agg(tag_name) AS tag_names\
        FROM tags\
        WHERE tag_id = ANY($5)\
      ) AS t ON TRUE'
    });
    createPost.values = [username, post, title, url, tag_ids];

    const postRow = await t.one(createPost);

    await t.none(
      'INSERT INTO posts_tags (post_id, tags) \
      VALUES ($1, $2)', [postRow.post_id, tag_ids]);

    delete postRow.post_id;
    return postRow;
  });
};

export const getPost = async (
  url: string
): Promise<IPost | null> => {
  const query = new PS({ name: 'get-post', text: '\
    SELECT TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date,\
      post, title, url, a.username, a.name, t.tag_names FROM posts p \
    LEFT JOIN (\
      SELECT array_agg(tag_name) AS tag_names\
      FROM tags\
      WHERE tag_id = ANY(\
        SELECT unnest(tags) FROM posts\
        WHERE url = $1)\
    ) AS t ON TRUE\
    INNER JOIN accounts a on a.user_id = p.user_id \
    WHERE p.url=$1'
  });

  query.values = [url];
  return await db.oneOrNone(query);
};

export const getPosts = async (
  offset: number,
  tag: string | null,
  year: number | null
): Promise<IPost[]> => {

  /* Return latest 13 because the page should only show
   * 12 results. The 13th item is used as an indicator
   * for the pagination
   */
  if (tag) {
    if (year) {
      // return latest 13 of tags of year
      const query = new PS({ name: 'get-latest-posts-from-tag-of-year', text: '\
        SELECT TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date,\
          (SELECT array_agg(tag_name) FROM tags WHERE tag_id = ANY(p.tags)) as tags,\
          p.post, p.title, p.url, a.name FROM posts p \
        INNER JOIN accounts a ON a.user_id = p.user_id \
        INNER JOIN tags t ON t.tag_name = $2 \
        INNER JOIN posts_tags pt ON pt.post_id = p.post_id \
          WHERE t.tag_id = ANY(pt.tags) AND \
            DATE_PART(\'year\', p.date) = $1\
        ORDER BY p.date desc LIMIT 13 OFFSET $3 \
        ', values: [year, tag, offset]
      });

      query.values = [year, tag, offset];
      return await db.manyOrNone(query);
    } else {
      // return latest 13 of tags
      const query = new PS({ name: 'get-latest-posts-from-tag', text: '\
        SELECT TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date,\
          (SELECT array_agg(tag_name) FROM tags WHERE tag_id = ANY(p.tags)) as tags,\
          p.post, p.title, p.url, a.name FROM posts p \
        INNER JOIN accounts a ON a.user_id = p.user_id \
        INNER JOIN tags t ON t.tag_name = $1 \
        INNER JOIN posts_tags pt ON pt.post_id = p.post_id \
          WHERE t.tag_id = ANY(pt.tags) \
        ORDER BY p.date desc LIMIT 13 OFFSET $2'
      });

      query.values = [tag, offset];
      return await db.manyOrNone(query);
    }
  } else {
    if (year) {
      // return latest 13 of year
      const query = new PS({ name: 'get-latest-posts-from-year', text: '\
        SELECT TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date,\
          (SELECT array_agg(tag_name) FROM tags WHERE tag_id = ANY(p.tags)) as tags,\
          p.post, p.title, p.url, a.name FROM posts p \
        INNER JOIN accounts a on a.user_id = p.user_id \
          WHERE DATE_PART(\'year\', p.date) = $1\
        ORDER BY p.date desc LIMIT 13 OFFSET $2'
      });

      query.values = [year, offset];
      return await db.manyOrNone(query);
    } else {
      // return latest 13
      const query = new PS({ name: 'get-latest-posts', text: '\
        SELECT TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date,\
          (SELECT array_agg(tag_name) FROM tags WHERE tag_id = ANY(p.tags)) as tags,\
          p.post, p.title, p.url, a.name FROM posts p \
        INNER JOIN accounts a on a.user_id = p.user_id \
        ORDER BY p.date desc LIMIT 13 OFFSET $1'
      });

      query.values = [offset];
      return await db.manyOrNone(query);
    }
  }
};

export const getUserPosts = async (
  username: string,
  offset: number
): Promise<IPost[]> => {
  // Returns posts in the range `offset` to `offset + 10` by account `username`
  const query = new PS({ name: 'get-user-posts', text: '\
    SELECT TO_CHAR(p.date, \'Mon DD, YYYY - HH24:MI:SS\') date,\
      (SELECT array_agg(tag_name) FROM tags WHERE tag_id = ANY(p.tags)) as tags,\
      p.post, p.title, p.url, a.username, a.name FROM posts p \
    INNER JOIN accounts a on a.user_id = p.user_id \
    WHERE a.username=$1\
    ORDER BY p.date desc LIMIT 21 OFFSET $2'
  });

  query.values = [username, offset];
  return await db.manyOrNone(query);
};

export const deletePost = async (
  username: string,
  role: string,
  url: string
): Promise<void> => {
  if (role === 'admin' || role === 'mod') {
    const query = new PS({ name: 'delete-post-force', text: '\
      DELETE FROM posts WHERE url=$1'
    });

    query.values = [url];
    await db.none(query);
  } else if (role === 'user') {
    const query = new PS({ name: 'delete-post-user', text: '\
      DELETE FROM posts WHERE url=$1 AND\
        user_id = (SELECT user_id FROM accounts WHERE username = $2)'
    });

    query.values = [url, username];
    await db.none(query);
  }
};

export const editPost = async (
  username: string,
  role: string,
  post: string,
  title: string,
  url: string,
  newUrl: string,
  tags?: string[]
): Promise<void> => {
  const query = new PS({ name: 'edit-post', text: '\
    UPDATE posts\
      SET post=$1, title=$2, url=$4\
    WHERE url=$3'
  });

  query.values = [post, title, url, newUrl];
  return await db.tx(async t => {
    const postInfoQuery = getPostInfoQuery(url, username);
    const postExists = await t.oneOrNone(postInfoQuery);

    const tempArr = (tags) ? tags.slice() : [];
    const tag_ids = (tempArr.length)
      ? (await t.batch(
        tempArr.map((tag) => t.one(createTagQuery(tag)))
      )).map((obj) => Number(obj.tag_id))
      : [];

    const queries = editTagsQuery(url, tag_ids);
    queries.unshift(query);

    if (postExists) {
      const { editor, creator } = postExists;
      if (
        (role === 'admin' || role === 'mod')
        || ((role === 'user') && (editor === creator))
      ) {
        await t.batch(queries.map((query) => t.none(query)));
      }
    }
  });
};

const getPostInfoQuery = (
  url: string,
  username: string
): QueryParam => {
  const query = new PS({ name: 'get-post-info', text: '\
    WITH sel (user_id) AS (\
      SELECT user_id FROM accounts WHERE username = $2\
    )\
    SELECT a.user_id as editor, sel.user_id as creator FROM sel\
    INNER JOIN posts p on p.url = $1\
    INNER JOIN accounts a on a.user_id = p.user_id'
  });

  query.values = [url, username];
  return query;
};

const createTagQuery = (
  tag: string
): QueryParam => {
  /* If the tag is not in the database,
   * create tag, returning tag_id. Else,
   * return its tag_id.
   */
  const query = new PS({ name: 'create-tag', text: '\
    WITH ins AS (\
      INSERT INTO tags (tag_name)\
      VALUES ($1)\
      ON     CONFLICT (tag_name) DO UPDATE\
      SET    tag_name = NULL \
      WHERE  FALSE\
      RETURNING tag_id\
      )\
    SELECT tag_id FROM ins\
      UNION  ALL\
      SELECT tag_id FROM tags\
      WHERE  tag_name = $1'
  });

  query.values = [tag];
  return query;
};

const editTagsQuery = (
  url: string,
  tag_ids: number[]
): QueryParam[] => {
  const updateTagsInPosts = new PS({ name: 'edit-tags-posts', text: '\
    UPDATE posts SET tags = $2\
    WHERE url = $1'
  });
  updateTagsInPosts.values = [url, tag_ids];

  const updateTagsInPostsTags = new PS({ name: 'edit-tags-posts-tags', text: '\
    UPDATE posts_tags pt\
      SET tags = $2\
    FROM (SELECT post_id FROM posts WHERE url=$1) p\
    WHERE pt.post_id = p.post_id'
  });
  updateTagsInPostsTags.values = [url, tag_ids];

  return [updateTagsInPosts, updateTagsInPostsTags];
};
