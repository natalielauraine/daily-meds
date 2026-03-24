// Gradient colour picker — shows a row of circular swatches.
// Used in admin forms to let Natalie pick a brand gradient for a session or live event.
// Clicking a swatch sets it as selected (shown with a white outline ring).

const GRADIENTS = [
  { label: "Purple / Blue",   value: "linear-gradient(135deg, #6B21E8 0%, #8B3CF7 25%, #6366F1 60%, #3B82F6 80%, #22D3EE 100%)" },
  { label: "Pink / Yellow",   value: "linear-gradient(135deg, #F43F5E 0%, #EC4899 20%, #D946EF 35%, #F97316 65%, #EAB308 85%, #FACC15 100%)" },
  { label: "Green / Lime",    value: "linear-gradient(135deg, #10B981 0%, #22C55E 35%, #84CC16 70%, #D9F100 100%)" },
  { label: "Pink / Orange",   value: "linear-gradient(135deg, #F43F5E 0%, #F97316 100%)" },
  { label: "Purple / Indigo", value: "linear-gradient(135deg, #6B21E8 0%, #6366F1 100%)" },
  { label: "Teal / Green",    value: "linear-gradient(135deg, #10B981 0%, #22C55E 100%)" },
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
