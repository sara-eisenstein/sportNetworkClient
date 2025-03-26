import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import { getUserImage } from '../../services/userService';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { currentUser } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState<string>('/default-avatar.webp');

    useEffect(() => {
        const loadProfileImage = async () => {
            if (currentUser?.userId) {
                try {
                    const imageUrl = await getUserImage(currentUser.userId);
                    setProfileImageUrl(imageUrl);
                } catch (error) {
                    console.error('Failed to load profile image:', error);
                    setProfileImageUrl('/default-avatar.webp');
                }
            }
        };

        loadProfileImage();
    }, [currentUser?.userId]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-text">FitSocial</span>
                </Link>
                
                <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                    <li className="nav-item">
                        <Link 
                            to="/" 
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            דף הבית
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link 
                            to="/profiles" 
                            className={`nav-link ${isActive('/profiles') ? 'active' : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            משתמשים
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link 
                            to="/challenges" 
                            className={`nav-link ${isActive('/challenges') ? 'active' : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            אתגרים
                        </Link>
                    </li>
                    {currentUser ? (
                        <>
                            <li className="nav-item">
                                <Link 
                                    to="/chat" 
                                    className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    צ'אט
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    to="/profile" 
                                    className={`nav-link profile-link ${isActive('/profile') ? 'active' : ''}`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <img 
                                        src={profileImageUrl}
                                        alt={`${currentUser.firstName} ${currentUser.lastName}`}
                                        className="profile-image"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (target.src !== '/default-avatar.webp') {
                                                target.src = '/default-avatar.webp';
                                            }
                                        }}
                                    />
                                    <span>הפרופיל שלי</span>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className="nav-link logout-button" 
                                    onClick={() => {
                                        handleLogout();
                                        setMenuOpen(false);
                                    }}
                                >
                                    התנתק
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <Link 
                                    to="/login" 
                                    className="nav-link login-link"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    התחבר
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    to="/register" 
                                    className="nav-link register-link"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    הרשמה
                                </Link>
                            </li>
                        </>
                    )}
                </ul>

                <div className="menu-icon" onClick={toggleMenu}>
                    <div className={`menu-bars ${menuOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 