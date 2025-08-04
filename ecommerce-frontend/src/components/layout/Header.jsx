import React from 'react';
import { Link } from 'react-router-dom';
import CartIcon from './CartIcon';
import SearchBar from './SearchBar';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <h1>E-Commerce Store</h1>
        </Link>
        
        <SearchBar />
        
        <nav className={styles.nav}>
          <Link to="/products" className={styles.navLink}>
            Products
          </Link>
          <CartIcon />
        </nav>
      </div>
    </header>
  );
};

export default Header;