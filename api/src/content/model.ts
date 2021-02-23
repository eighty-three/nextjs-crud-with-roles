import db from '@utils/db';
import { PreparedStatement as PS } from 'pg-promise';
import { IPost, IError } from './types';

export const createPost = async (
  username: string,
  post: string,
  title: string,
  url: string,
  tags?: string[]
): Promise<IPost|IError> => {
  try {
    const tag_ids = (tags) ? await createTags(tags) : [];

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

    return await db.task(async t => {
      const postRow = await t.one(createPost);
      await t.none(
        'INSERT INTO posts_tags (post_id, tags) \
        VALUES ($1, $2)', [postRow.post_id, tag_ids]);
      delete postRow.post_id;
      return postRow;
    });
  } catch (err) {
    if (err.message === 'duplicate key value violates unique constraint "posts_url_key"') {
      return { error: 'The url already exists' };
    } else {
      return { error: 'Something went wrong' };
    }
  }
};

export const deletePost = async (
  url: string
): Promise<void> => {
  const query = new PS({ name: 'delete-post', text: '\
    DELETE FROM posts WHERE url=$1'
  });

  query.values = [url];
  await db.none(query);
};

export const editPost = async (
  url: string,
  post: string
): Promise<void> => {
  const query = new PS({ name: 'edit-post', text: '\
    UPDATE posts SET post=$2 WHERE url=$1'
  });

  query.values = [url, post];
  await db.none(query);
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

export const getPosts = async (
  offset: number,
  tag?: string,
  year?: number
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
        ORDER BY p.date desc LIMIT 6 OFFSET $2'
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
        ORDER BY p.date desc LIMIT 6 OFFSET $1'
      });

      query.values = [offset];
      return await db.manyOrNone(query);
    }
  }
};

export const createTags = async (
  tags: string[]
): Promise<number[]> => {
  if (tags) {
    const tag_ids = await db.tx(t => {
      const tagQueries = tags.map((tag) => {
        /* If the tag is not in the database,
         * create tag, returning tag_id. Else,
         * return its tag_id.
         */
        const tagQuery = new PS({ name: 'create-tag', text: '\
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

        tagQuery.values = [tag];
        return t.one(tagQuery);
      });

      return t.batch(tagQueries);
    });

    return tag_ids.map((tag) => Number(tag.tag_id));
  } else {
    return [];
  }
};

export const editTags = async (
  url: string,
  tags: string[]
): Promise<void> => {
  const tag_ids = await createTags(tags);
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

  await db.tx(async t => {
    return await t.batch([
      t.none(updateTagsInPosts),
      t.none(updateTagsInPostsTags)
    ]);
  });
};
