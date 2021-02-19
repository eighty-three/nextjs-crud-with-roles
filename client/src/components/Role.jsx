import React, { useState } from 'react';
import PropTypes from 'prop-types';

import styles from './Role.module.scss';
import useButton from '@/hooks/useButton';
import { changeRole } from '@/lib/account';

const propTypes = {
  username: PropTypes.string,
  roleProp: PropTypes.string
};

const Role = (props) => {
  const {
    username,
    roleProp
  } = props;

  const [buttonState, setButtonState] = useButton(roleProp);
  const [currentRole, setCurrentRole] = useState(roleProp);
  const [toggleDropdown, setToggle] = useState(false);
  const roles = ['new', 'user', 'mod'];

  const onClickFn = async (newRole, e) => {
    e.preventDefault();

    if (currentRole === newRole) {
      setToggle(false);
      return;
    }

    setButtonState({ disabled: true, text: 'Changing...' });

    const req = await changeRole(username, newRole);
    if (req?.error) {
      setButtonState({ disabled: false, text: req.error });
      setToggle(false);
    } else {
      setButtonState({ disabled: false, text: newRole });
      setCurrentRole(newRole);
      setToggle(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.role}>
        <button
          className={styles.button}
          onClick={() => setToggle(!toggleDropdown)}
          onBlur={() => setToggle(false)}
        >
          {buttonState.text}
        </button>
        <div
          className={
            toggleDropdown
              ? `${styles.dropdownItems} ${styles.show}`
              : styles.dropdownItems
          }
        >
          {roles.map((role) => (
            <a
              key={role}
              href={'#'}
              onClick={(e) => onClickFn(role, e)}
            >
              {role}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

Role.propTypes = propTypes;
export default React.memo(Role);
