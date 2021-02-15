import React from 'react';

import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

const AdminPanelTabs = () => {
  return (
    <>
      {/* Override Bootstrap styling */}
      <style type="text/css">
        {`
            .nav-link, .nav-link:hover {
              color: rgb(130, 25, 25);
              outline-color: rgba(130, 25, 25, 0.5);
            }

            .form-control:focus {
              border-color: rgba(130, 25, 25, 0.3);
              box-shadow: 0 0 0 0.2rem rgba(130, 25, 25, 0.15);
            }
        `}
      </style>

      <Tabs
        className={'nav-fill'}
        defaultActiveKey="Accounts"
        id="modes"
        transition={false}
        mountOnEnter={true}
        unmountOnExit={true}
      >
        <Tab eventKey="Accounts" title="Accounts">
          <h1>Accounts</h1>
        </Tab>

        <Tab eventKey="Events" title="Events">
          <h1>Logs</h1>
        </Tab>
      </Tabs>
    </>
  );
};

export default AdminPanelTabs;
