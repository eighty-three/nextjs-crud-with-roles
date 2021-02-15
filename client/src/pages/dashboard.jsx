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

const Dashboard = (props) => {
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
        <h1>{username}</h1>
        <h1>{role}</h1>
      </section>
    </Layout>
  );
};

Dashboard.propTypes = propTypes;

export default withAuthComponent(Dashboard, 'protectRoute', ['new', 'user', 'mod', 'admin']);
export const getServerSideProps = withAuthServerSideProps(async ({ username, role }) => {
  return {
    props:
      {
        username,
        role
      }
  };
});
