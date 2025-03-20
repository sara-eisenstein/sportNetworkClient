import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { addChallenge } from '../../store/slices/challengeSlice';
import './CreateChallenge.css';

const CreateChallenge: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [level, setLevel] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (title && description && startDate && endDate) {
            // המרת התאריך לפורמט הנכון (dd/MM/yyyy)
            const formatDate = (date: string) => {
                const d = new Date(date);
                return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
            };

            dispatch(addChallenge({
                Title: title,
                Description: description,
                Level: level,
                StartDate: formatDate(startDate),
                EndDate: formatDate(endDate)
            }));

            // איפוס הטופס
            setTitle('');
            setDescription('');
            setLevel(1);
            setStartDate('');
            setEndDate('');
        }
    };

    return (
        <div className="create-challenge">
            <h3>יצירת אתגר חדש</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">כותרת</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="שם האתגר"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">תיאור</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="תאר את מטרת האתגר בקצרה"
                        rows={2}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="level">רמת קושי</label>
                        <select
                            id="level"
                            value={level}
                            onChange={(e) => setLevel(Number(e.target.value))}
                            required
                        >
                            <option value={1}>קל</option>
                            <option value={2}>בינוני</option>
                            <option value={3}>קשה</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="startDate">תאריך התחלה</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="endDate">תאריך סיום</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">צור אתגר</button>
            </form>
        </div>
    );
};

export default CreateChallenge; 