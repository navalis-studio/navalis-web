export function NeonInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div className="relative">
      {/* Label flutuante sobre a borda */}
      <label className="font-mono text-[12px] font-bold tracking-[0.1em] text-ink-black bg-paper-white px-2 absolute -top-2 left-4 z-10 uppercase">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-light-grain text-ink-black p-4 font-sans text-base placeholder:text-mid-tone-grey relative z-0 rounded-lg outline-none transition-all"
        style={{
          border: "4px solid #000",
          boxShadow: "inset 2px 2px 0px rgba(0,0,0,0.1), 4px 4px 0px rgba(0,0,0,1)",
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = "inset 2px 2px 0px rgba(0,0,0,0.2), 6px 6px 0px rgba(0,0,0,1)";
          e.target.style.transform = "translate(-2px, -2px)";
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = "inset 2px 2px 0px rgba(0,0,0,0.1), 4px 4px 0px rgba(0,0,0,1)";
          e.target.style.transform = "translate(0, 0)";
        }}
      />
    </div>
  );
}
