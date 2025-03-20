import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { addChallenge } from '../../store/slices/challengeSlice';
import { ChallengeType } from '../../models/challenge';
import './CreateChallenge.css';

const CreateChallenge: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<ChallengeType>(ChallengeType.Running);
    const [goal, setGoal] = useState('');
    const [unit, setUnit] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (title && description && goal && unit && startDate && endDate) {
            dispatch(addChallenge({
                title,
                description,
                type,
                goal: Number(goal),
                unit,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                creatorId: 0 // יש להחליף עם המזהה של המשתמש המחובר
            }));

            // איפוס הטופס
            setTitle('');
            setDescription('');
            setType(ChallengeType.Running);
            setGoal('');
            setUnit('');
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
                        placeholder="הכנס כותרת לאתגר"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">תיאור</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="תאר את האתגר"
                        rows={4}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="type">סוג האתגר</label>
                    <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value as ChallengeType)}
                        required
                    >
                        {Object.values(ChallengeType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="goal">יעד</label>
                    <input
                        type="number"
                        id="goal"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="הכנס את היעד המספרי"
                        min="0"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="unit">יחידת מדידה</label>
                    <input
                        type="text"
                        id="unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="למשל: ק״מ, דקות, חזרות"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="startDate">תאריך התחלה</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="endDate">תאריך סיום</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>
                </div>

                <button type="submit" disabled={!title || !description || !goal || !unit || !startDate || !endDate}>
                    צור אתגר
                </button>
            </form>
        </div>
    );
};

export default CreateChallenge; 