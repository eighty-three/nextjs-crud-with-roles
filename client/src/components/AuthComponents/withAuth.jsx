import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Router, { useRouter } from 'next/router';

const RedirectComponentPropTypes = {
  redirectAction: PropTypes.string
};

const RedirectComponent = ({ redirectAction }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    const loadingText = (redirectAction === 'loggedIn')
      ? 'Already logged in'
      : 'Not authenticated';

    setText(loadingText);
  }, []);

  useEffect(() => {
    const prevPath = useRouter().pathname;
    const newPath = (redirectAction === 'loggedIn')
      ? '/dashboard'
      : `/login?redirect=${prevPath}`;
    Router.replace(newPath);
  }, []);

  return (
    <h1>{text}</h1>
  );
};

RedirectComponent.propTypes = RedirectComponentPropTypes;

const withAuthComponent = (Component, redirectAction, allowedRoles) => {
  const Authenticated = ({ username, role, data }) => {
    if (redirectAction === 'loggedIn') {
      // if user is already logged in
      if (username) return <RedirectComponent redirectAction={'loggedIn'} />;

    } else if (redirectAction === 'protectRoute') {
      // if payload has no username or role
      if (!username || !role) return <RedirectComponent redirectAction={'protectRoute'} />;

      // if payload has username and role but user doesn't have the required role
      if (!allowedRoles.includes(role)) return <RedirectComponent redirectAction={'protectRoute'} />;
    }

    return <Component {...data.props}/>;
  };

  Authenticated.propTypes = {
    username: PropTypes.string,
    role: PropTypes.string,
    data: PropTypes.shape({
      props: PropTypes.any
    })
  };

  return Authenticated;
};

export default withAuthComponent;
