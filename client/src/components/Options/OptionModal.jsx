import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import styles from './OptionModal.module.scss';
import Button from 'react-bootstrap/Button';

import useButton from '@/hooks/useButton';
import SetPassword from './SetPassword';
import DeleteAccount from './DeleteAccount';

const propTypes = {
  type: PropTypes.string,
  username: PropTypes.string,
  role: PropTypes.string,
  index: PropTypes.number
};

const OptionModal = (props) => {
  const {
    type,
    username,
    index
  } = props;

  const [buttonState] = useButton(type);
  const [show, setShow] = useState(false);
  const [ModalComponent, setModalComponent] = useState(null);

  useEffect(() => {
    switch (type) {
      case 'Set Password': {
        setModalComponent(
          <SetPassword
            show={show}
            setShow={setShow}
            username={username}
          />
        );
        break;
      }

      case 'Delete Account': {
        setModalComponent(
          <DeleteAccount
            show={show}
            setShow={setShow}
            username={username}
            index={index}
          />
        );
        break;
      }
    }
  }, [show]);

  return (
    <div className={styles.container}>
      <Button
        variant={'dark'}
        onClick={() => setShow(true)}
        disabled={buttonState.disabled}
      >
        {buttonState.text}
      </Button>
      {ModalComponent}
    </div>
  );
};

OptionModal.propTypes = propTypes;
export default OptionModal;
