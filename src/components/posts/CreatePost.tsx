import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { addNewPost } from '../../store/slices/postSlice';
import './CreatePost.css';

const CreatePost: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);
    const [content, setContent] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!content.trim()) {
            setError('תוכן הפוסט לא יכול להיות ריק');
            return;
        }

        try {
            setIsSubmitting(true);
            
            const formData = new FormData();
            
            // הוספת שדות בסיסיים
            formData.append('Content', content.trim());
            formData.append('CreatedDate', new Date().toISOString());
            
            // הוספת מזהה המשתמש אם קיים
            if (currentUser?.userId) {
                formData.append('UserId', currentUser.userId.toString());
            }
            
            // הוספת תמונה אם קיימת - שינוי שם השדה מ-ImageFile ל-File
            if (selectedImage) {
                formData.append('File', selectedImage);
            }

            console.log('📤 Preparing to create post with data:', {
                content: content.trim(),
                userId: currentUser?.userId,
                hasImage: !!selectedImage,
                imageFileName: selectedImage?.name,
                createdDate: new Date().toISOString()
            });

            const result = await dispatch(addNewPost(formData)).unwrap();
            console.log('✅ Post created successfully:', result);
            
            // ניקוי הטופס
            setContent('');
            setSelectedImage(null);
            
        } catch (error: any) {
            console.error('❌ Failed to create post:', error);
            let errorMessage = 'אירעה שגיאה ביצירת הפוסט';
            
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                errorMessage = Object.values(errors).flat().join(', ');
            } else if (error.response?.data?.title) {
                errorMessage = error.response.data.title;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            console.log('📸 Image selected:', {
                name: file.name,
                type: file.type,
                size: file.size
            });
            setSelectedImage(file);
        }
    };

    return (
        <div className="create-post">
            <h3>יצירת פוסט חדש</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="create-post-form">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="מה בא לך לשתף?"
                    rows={4}
                    disabled={isSubmitting}
                />
                
                <div className="image-upload">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        id="post-image"
                        disabled={isSubmitting}
                    />
                    <label htmlFor="post-image">
                        הוסף תמונה
                    </label>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        disabled={!content.trim() || isSubmitting}
                        className={isSubmitting ? 'submitting' : ''}
                    >
                        {isSubmitting ? 'שולח...' : 'פרסם'}
                    </button>
                </div>
            </form>
            {selectedImage && (
                <div className="selected-image-info">
                    נבחרה תמונה: {selectedImage.name}
                </div>
            )}
        </div>
    );
};

export default CreatePost; 