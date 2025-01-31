import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = ({ id, placeholder, required, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="password-input-container">
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
      />
      <button type="button" onClick={togglePasswordVisibility}>
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};

export default PasswordInput;
