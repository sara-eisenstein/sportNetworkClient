import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { currentUser } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-text">FitSocial</span>
                </Link>

                <div className="menu-icon" onClick={toggleMenu}>
                    <i className={menuOpen ? 'fas fa-times' : 'fas fa-bars'} />
                </div>

                <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                    <li className="nav-item">
                        <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
                            דף הבית
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/profiles" className="nav-link" onClick={() => setMenuOpen(false)}>
                            משתמשים
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/challenges" className="nav-link" onClick={() => setMenuOpen(false)}>
                            אתגרים
                        </Link>
                    </li>
                    {currentUser ? (
                        <>
                            <li className="nav-item">
                                <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    הפרופיל שלי
                                </Link>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link logout-button" onClick={() => {
                                    handleLogout();
                                    setMenuOpen(false);
                                }}>
                                    התנתק
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    התחבר
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/register" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    הרשמה
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar; 