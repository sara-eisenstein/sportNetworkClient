import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface Props {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
    const { currentUser } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (!currentUser) {
        // שומר את המיקום הנוכחי כדי שנוכל להחזיר את המשתמש לשם אחרי ההתחברות
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute; 