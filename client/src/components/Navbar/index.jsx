import React from 'react';
import Link from 'next/link';

import styles from './Navbar.module.css';

const siteTitle = 'CRUD WITH ROLES';

const Navbar = () => {
  return (
    <div className={`${styles.container}`}>
      <Link href='/' passHref>
        <a className={`${styles.title}`}>{siteTitle}</a>
      </Link>
    </div>
  );
};

export default Navbar;
