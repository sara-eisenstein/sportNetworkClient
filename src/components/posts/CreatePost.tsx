import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { addPost } from '../../store/slices/postSlice';
import './CreatePost.css';

const CreatePost: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim() || image) {
            const formData = new FormData();
            formData.append('content', content);
            if (image) {
                formData.append('image', image);
            }
            
            dispatch(addPost(formData));
            setContent('');
            setImage(null);
            setPreviewUrl(null);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreviewUrl(null);
    };

    return (
        <div className="create-post">
            <h3>יצירת פוסט חדש</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="מה בא לך לשתף?"
                    rows={4}
                />
                
                <div className="image-upload">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        id="post-image"
                    />
                    <label htmlFor="post-image">
                        הוסף תמונה
                    </label>
                </div>

                {previewUrl && (
                    <div className="image-preview">
                        <img src={previewUrl} alt="תצוגה מקדימה" />
                        <button type="button" onClick={handleRemoveImage}>
                            הסר תמונה
                        </button>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={!content.trim() && !image}
                >
                    פרסם
                </button>
            </form>
        </div>
    );
};

export default CreatePost; 