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

    const handleNavigation = (path: string) => {
        localStorage.setItem('lastActiveTab', path);
        navigate(path);
        setMenuOpen(false);
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    // Restore last active tab on component mount
    useEffect(() => {
        const lastActiveTab = localStorage.getItem('lastActiveTab');
        if (lastActiveTab && location.pathname === '/') {
            navigate(lastActiveTab);
        }
    }, [navigate, location.pathname]);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={() => handleNavigation('/')}>
                    <span className="logo-text">FitSocial</span>
                </Link>
                
                <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                            onClick={() => handleNavigation('/')}
                        >
                            דף הבית
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${isActive('/profiles') ? 'active' : ''}`}
                            onClick={() => handleNavigation('/profiles')}
                        >
                            משתמשים
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${isActive('/challenges') ? 'active' : ''}`}
                            onClick={() => handleNavigation('/challenges')}
                        >
                            אתגרים
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
                            onClick={() => handleNavigation('/chat')}
                        >
                            צ'אט
                        </button>
                    </li>
                    {currentUser ? (
                        <>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link profile-link ${isActive('/profile') ? 'active' : ''}`}
                                    onClick={() => handleNavigation('/profile')}
                                >
                                    <img 
                                        src={profileImageUrl} 
                                        alt="Profile" 
                                        className="profile-image"
                                    />
                                    פרופיל
                                </button>
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
                                <button 
                                    className="nav-link login-link"
                                    onClick={() => handleNavigation('/login')}
                                >
                                    התחבר
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className="nav-link register-link"
                                    onClick={() => handleNavigation('/register')}
                                >
                                    הרשמה
                                </button>
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