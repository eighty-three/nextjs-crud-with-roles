import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';

import Layout, { siteTitle } from '@/components/Layout';
import withAuthComponent from '@/components/AuthComponents/withAuth';
import withAuthServerSideProps from '@/components/AuthComponents/withAuthGSSP';

const propTypes = {
  username: PropTypes.string,
  role: PropTypes.string
};

const AdminPanel = (props) => {
  const {
    username,
    role
  } = props;

  return (
    <Layout username={username}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        <h1>admin</h1>
        <h1>{username}</h1>
        <h1>{role}</h1>
      </section>
    </Layout>
  );
};

AdminPanel.propTypes = propTypes;

export default withAuthComponent(AdminPanel, 'protectRoute', ['admin']);
export const getServerSideProps = withAuthServerSideProps(async (ctx, username, role) => {
  return {
    props:
      {
        username,
        role
      }
  };
});
