import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { useUpdateUserMutation } from "../redux/userApi";
import { setCredentials } from "../redux/userSlice";

const UpdateProfileForm = ({ user, setIsEditing }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const dispatch = useDispatch();
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const handleUpdate = async e => {
    e.preventDefault();

    // Check if the name or email has changed
    if (name === user.name && email === user.email) {
      toast.info("No changes detected");
      setIsEditing(false); // Close the edit form without making a request
      return;
    }

    if (!name || !email) return;

    try {
      const { data } = await updateUser({ name, email }).unwrap();
      dispatch(setCredentials(data));
      toast.success("Profile updated successfully");
      setIsEditing(false); // Close the edit form and show the dashboard
    } catch (err) {
      toast.error(err?.data?.message); // Show error message if update fails
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-green-400 mb-3">
          Edit Profile Information
        </h3>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-2 bg-gray-900 text-gray-300 rounded-lg focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 bg-gray-900 text-gray-300 rounded-lg focus:outline-none"
            required
          />
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
              font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)} // Close the edit form and show the dashboard when "Cancel" is clicked
            className="py-2 px-4 bg-red-500 text-white font-bold rounded-lg shadow-lg hover:bg-red-600 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default UpdateProfileForm;
