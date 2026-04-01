// Gradient colour picker — shows a row of circular swatches.
// Used in admin forms to let Natalie pick a brand gradient for a session or live event.
// Clicking a swatch sets it as selected (shown with a white outline ring).

const GRADIENTS = [
  { label: "Purple / Blue",   value: "linear-gradient(135deg, #ff41b3 0%, #ec723d 25%, #adf225 60%, #adf225 80%, #adf225 100%)" },
  { label: "Pink / Yellow",   value: "linear-gradient(135deg, #ff41b3 0%, #ff41b3 20%, #ff41b3 35%, #ec723d 65%, #f4e71d 85%, #f4e71d 100%)" },
  { label: "Green / Lime",    value: "linear-gradient(135deg, #adf225 0%, #adf225 35%, #adf225 70%, #f4e71d 100%)" },
  { label: "Pink / Orange",   value: "linear-gradient(135deg, #ff41b3 0%, #ec723d 100%)" },
  { label: "Purple / Indigo", value: "linear-gradient(135deg, #ff41b3 0%, #adf225 100%)" },
  { label: "Teal / Green",    value: "linear-gradient(135deg, #adf225 0%, #adf225 100%)" },
];

// Export the list so pages can use it without redeclaring it
export { GRADIENTS };

type GradientPickerProps = {
  value: string;
  onChange: (gradient: string) => void;
};

export default function GradientPicker({ value, onChange }: GradientPickerProps) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-2">Colour</label>
      <div className="flex flex-wrap gap-2">
        {GRADIENTS.map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => onChange(g.value)}
            title={g.label}
            aria-label={g.label}
            className="w-10 h-10 rounded-full transition-transform hover:scale-110"
            style={{
              background: g.value,
              outline: value === g.value ? "2.5px solid white" : "none",
              outlineOffset: "2px",
            }}
          />
        ))}
      </div>
    </div>
  );
}
