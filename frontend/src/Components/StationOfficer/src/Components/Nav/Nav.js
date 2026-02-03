import React from 'react';
import './nav.css';
import { Link } from "react-router-dom";

function Nav() {
  return (
    <div>
      <nav>
        <ul className="home-ul">
          <li className='home-11'>
            <Link to="/mainhome" className="home-a">
              <h1>Home</h1>
            </Link>
          </li>
          <li className='home-11'>
            <Link to="/add-user" className="home-a"> {/* Changed to match App.js route */}
              <h1>Add User</h1>
            </Link>
          </li>
          <li className='home-11'>
            <Link to="/user-details" className="home-a"> {/* Changed to match App.js route */}
              <h1>User Details</h1>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Nav;