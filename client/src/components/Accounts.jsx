import React, { useState } from 'react';
import PropTypes from 'prop-types';

import styles from './Accounts.module.scss';
import roleStyle from './Role.module.scss';
import Options from '@/components/Options';
import Role from '@/components/Role';
import AccountsContext from '@/contexts/AccountsContext';

const propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string,
      role: PropTypes.string
    })
  )
};

const Accounts = (props) => {
  const {
    accounts
  } = props;
  const [accountsArr, setArr] = useState(accounts.slice(0, 10));

  return (
    <AccountsContext.Provider value={setArr}>
      <div className={styles.container}>
        {accountsArr.map((account, index) => (
          <div key={account.username} className={styles.account}>
            <div className={styles.username}>{account.username}</div>

            {(account.role !== 'admin' && account.role !== 'deleted')
              ? (
                <>
                  <Role username={account.username} roleProp={account.role} />
                  <Options username={account.username} index={index} />
                </>
              ) : (
                <span className={`${roleStyle.text} ${roleStyle.container}`}>{account.role}</span>
              )
            }
          </div>
        ))}
      </div>
    </AccountsContext.Provider>
  );
};

Accounts.propTypes = propTypes;
export default Accounts;
