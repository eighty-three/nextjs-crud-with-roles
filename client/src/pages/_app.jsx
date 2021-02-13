import '../styles/global.css';
import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  Component: PropTypes.elementType,
  pageProps: PropTypes.object
};

const App = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

App.propTypes = propTypes;

export default App;
