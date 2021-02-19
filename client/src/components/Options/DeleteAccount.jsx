import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import styles from './index.module.scss';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import AccountsContext from '@/contexts/AccountsContext';

import useButton from '@/hooks/useButton';
import { deleteAccount } from '@/lib/account';

const propTypes = {
  show: PropTypes.bool,
  setShow: PropTypes.func,
  username: PropTypes.string,
  index: PropTypes.number
};

const DeleteAccount = (props) => {
  const {
    show,
    setShow,
    username,
    index
  } = props;

  const [buttonState, setButtonState] = useButton('Delete Account');
  const setArr = useContext(AccountsContext);

  const onClickFn = async (username) => {
    setButtonState({ disabled: true, text: 'Deleting...' });

    const req = await deleteAccount(username);
    if (req?.error) {
      setButtonState({ disabled: false, text: req.error });
    } else {
      setArr((prev) => {
        const left = prev.slice(0, index);
        const right = prev.slice(index+1);
        const item = { username, role: 'deleted' };
        return left.concat(item, right);
      });
      setShow(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      backdropClassName={styles.hide}
      centered
    >
      <Modal.Body>Are you sure you want to delete the account?</Modal.Body>
      <Modal.Footer>
        <Button
          variant={'danger'}
          onClick={() => onClickFn(username)}
          disabled={buttonState.disabled}
        >
          {buttonState.text}
        </Button>
        <Button variant={'outline-secondary'} onClick={() => setShow(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

DeleteAccount.propTypes = propTypes;
export default DeleteAccount;
