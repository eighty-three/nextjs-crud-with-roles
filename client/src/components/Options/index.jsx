import React from 'react';
import PropTypes from 'prop-types';

import styles from './index.module.scss';
import OptionModal from './OptionModal';

const propTypes = {
  username: PropTypes.string,
  index: PropTypes.number
};

const Options = (props) => {
  const {
    username,
    index
  } = props;

  return (
    <div className={styles.container}>
      <OptionModal
        type={'Set Password'}
        username={username}
      />

      <OptionModal
        type={'Delete Account'}
        username={username}
        index={index}
      />
    </div>
  );
};

Options.propTypes = propTypes;
export default Options;
