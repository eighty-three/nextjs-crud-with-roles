import React from 'react';
import Head from 'next/head';

import Layout, { siteTitle } from '@/components/Layout';

const Home = () => {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
      </section>
    </Layout>
  );
};

export default Home;
