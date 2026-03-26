import { EyeIcon } from '../Icons/Icons';

/**
 * InputField - Reusable form input component
 * Supports icons, password toggle, error display
 */
const InputField = ({ 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  error, 
  icon, 
  showToggle, 
  onToggle, 
  showPass,
  id,
}) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">
      {label}
    </label>
    <div className="relative group">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-200">
          {icon}
        </span>
      )}
      <input
        id={id}
        type={showToggle ? (showPass ? "text" : "password") : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={type === "email" ? "email" : type === "password" ? "current-password" : "off"}
        className={`w-full bg-slate-800/60 border ${
          error 
            ? "border-red-500 focus:ring-red-500/30" 
            : "border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
        } text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200
          ${icon ? "pl-10" : ""} ${showToggle ? "pr-10" : ""}`}
      />
      {showToggle && (
        <button 
          type="button" 
          onClick={onToggle}
          aria-label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <EyeIcon show={showPass} />
        </button>
      )}
    </div>
    {error && (
      <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 animate-fade-in">
        <span>⚠</span> {error}
      </p>
    )}
  </div>
);

export default InputField;
