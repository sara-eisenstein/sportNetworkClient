import React, { useState } from 'react';
import UsersGrid from '../components/UsersGrid';

const ProfilesPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="profiles-page">
            <div className="search-container" style={{ margin: '20px 0', textAlign: 'center' }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="חפש לפי שם..."
                    style={{
                        padding: '8px 12px',
                        fontSize: '16px',
                        width: '300px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        direction: 'rtl'
                    }}
                />
            </div>
            <UsersGrid searchTerm={searchTerm} />
        </div>
    );
};

export default ProfilesPage; 