import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';

import Layout, { siteTitle } from '@/components/Layout';
import withAuthComponent from '@/components/AuthComponents/withAuth';
import withAuthServerSideProps from '@/components/AuthComponents/withAuthGSSP';
import AdminPanelTabs from '@/components/AdminPanelTabs';

import { getAccounts } from '@/lib/account';

const propTypes = {
  username: PropTypes.string,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string,
      role: PropTypes.string
    })
  )
};

const AdminPanel = (props) => {
  const {
    username,
    accounts
  } = props;
  return (
    <Layout username={username}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        <AdminPanelTabs accounts={accounts} />
      </section>
    </Layout>
  );
};

AdminPanel.propTypes = propTypes;

export default withAuthComponent(AdminPanel, 'protectRoute', ['admin']);
export const getServerSideProps = withAuthServerSideProps(async ({ username, ctx }) => {
  const accounts = await getAccounts(ctx);

  return {
    props:
      {
        accounts,
        username
      }
  };
});
