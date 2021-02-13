import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';

import styles from './index.module.css';
import Navbar from '@/components/Navbar';

export const siteTitle = 'Next.js CRUD with roles';

const propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ])
};

const Layout = (props) => {
  const {
    children
  } = props;

  return (
    <div className={styles.container}>
      {/* Meta Tags */}
      <Head>
        <link rel='icon' href='/favicon.ico' />
        <meta
          name='description'
          content={siteTitle}
        />
      </Head>

      {/* Contents */}
      <main>
        <Navbar />
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = propTypes;
export default Layout;
