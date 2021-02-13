import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';

import Layout from '@/components/Layout';

const propTypes = {
  statusCode: PropTypes.number,
  error: PropTypes.string
};

const Custom404 = ({ statusCode, error }) => {
  return (
    <>
      <Layout>
        <Head>
          <title>Page Not Found</title>
        </Head>
        <>
          {statusCode
            ? <h1>{statusCode} - {error}</h1>
            : <h1>404 - Not Found</h1>
          }
        </>
      </Layout>
    </>
  );
};

Custom404.propTypes = propTypes;
export default Custom404;
