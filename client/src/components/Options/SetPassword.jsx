import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

import styles from './index.module.scss';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import useButton from '@/hooks/useButton';
import { setPassword } from '@/lib/account';

const propTypes = {
  show: PropTypes.bool,
  setShow: PropTypes.func,
  username: PropTypes.string
};

const SetPassword = (props) => {
  const {
    show,
    setShow,
    username
  } = props;

  const [buttonState, setButtonState] = useButton('Save Changes');
  const { register, handleSubmit } = useForm();

  const onClickFn = async ({ password }) => {
    setButtonState({ disabled: true, text: 'Setting...' });

    const req = await setPassword(username, password);
    if (req?.error) {
      setButtonState({ disabled: false, text: req.error });
    } else {
      setButtonState({ disabled: false, text: 'Save Changes' });
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
      <Modal.Header>
        <Modal.Title>Set Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className={'mx-auto'} onSubmit={handleSubmit(onClickFn)}>
          <Form.Group controlId={'change_password'}>
            <Form.Label>Password:</Form.Label>
            <Form.Control
              type="text"
              hideLength={30}
              pattern="[a-zA-Z0-9_]{1,29}"
              placeholder="[ a-z0-9_ ]{1,29}"
              spellCheck="false"
              aria-describedby={'password'}
              name={'password'}
              ref={register({ required: true })}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant={'primary'}
          onClick={handleSubmit(onClickFn)}
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

SetPassword.propTypes = propTypes;
export default SetPassword;
