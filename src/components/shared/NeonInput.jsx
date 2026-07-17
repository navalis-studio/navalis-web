import { useState } from "react";

export function NeonInput({ label, value, onChange, type = "text", placeholder }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative">
      {/* Label flutuante sobre a borda */}
      <label className="font-mono text-[12px] font-bold tracking-[0.1em] text-ink-black bg-paper-white px-2 absolute -top-2 left-4 z-10 uppercase">
        {label}
      </label>
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-light-grain text-ink-black p-3 ${isPassword ? "pr-11" : ""} font-sans text-sm placeholder:text-mid-tone-grey relative z-0 rounded-lg outline-none transition-all`}
        style={{
          border: "3px solid #000",
          boxShadow: "inset 2px 2px 0px rgba(0,0,0,0.1), 3px 3px 0px rgba(0,0,0,1)",
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = "inset 2px 2px 0px rgba(0,0,0,0.2), 5px 5px 0px rgba(0,0,0,1)";
          e.target.style.transform = "translate(-1px, -1px)";
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = "inset 2px 2px 0px rgba(0,0,0,0.1), 3px 3px 0px rgba(0,0,0,1)";
          e.target.style.transform = "translate(0, 0)";
        }}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-mid-tone-grey hover:text-ink-black transition-colors"
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {showPassword ? "visibility_off" : "visibility"}
          </span>
        </button>
      )}
    </div>
  );
}
