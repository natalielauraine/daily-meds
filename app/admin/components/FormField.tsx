// Wrapper for a labelled form field — used in all admin forms.
// Renders a label above whatever input, select or textarea you pass as children.

import { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  children: ReactNode;
  // Pass "sm:col-span-2" here when the field should span both grid columns
  className?: string;
};

export default function FormField({ label, children, className = "" }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// Shared input / select / textarea styles — import and spread onto your element
export const fieldStyle = {
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "0.5px solid rgba(255,255,255,0.12)",
} as const;

export const fieldClass =
  "w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none placeholder:text-white/20";
