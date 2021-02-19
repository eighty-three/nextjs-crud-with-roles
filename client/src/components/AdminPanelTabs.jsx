import React from 'react';
import PropTypes from 'prop-types';

import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Accounts from '@/components/Accounts';

const propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string,
      role: PropTypes.string
    })
  )
};

const AdminPanelTabs = (props) => {
  const {
    accounts
  } = props;

  return (
    <>
      {/* Override Bootstrap styling */}
      <style type="text/css">
        {`
            .nav-link, .nav-link:hover {
              color: rgb(130, 25, 25);
              outline-color: rgba(130, 25, 25, 0.5);
            }
        `}
      </style>

      <Tabs
        className={'nav-fill'}
        defaultActiveKey="Accounts"
        id="modes"
        transition={false}
        mountOnEnter={true}
        unmountOnExit={false}
      >
        <Tab eventKey="Accounts" title="Accounts">
          <Accounts accounts={accounts} />
        </Tab>

        <Tab eventKey="Events" title="Events">
          <h1>Logs</h1>
        </Tab>
      </Tabs>
    </>
  );
};

AdminPanelTabs.propTypes = propTypes;
export default AdminPanelTabs;
