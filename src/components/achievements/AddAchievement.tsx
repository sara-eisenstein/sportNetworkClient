import { useState } from "react";
import { useDispatch } from "react-redux";
import { addNewAchievement } from "../../store/slices/achievementsSlice";
import { AppDispatch } from "../../store/store";

interface Props {
  userId: number;
}

const AddAchievement: React.FC<Props> = ({ userId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(addNewAchievement({ userId, title, description, dateEarned: new Date().toISOString() }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <button type="submit">Add Achievement</button>
    </form>
  );
};

export default AddAchievement;
