import React, { useState } from 'react';
import { WidgetData } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  data: WidgetData;
  onResponse: (response: string) => void;
}

export const FormWidget: React.FC<Props> = ({ data, onResponse }) => {
  const fields = data.fields || [{ name: 'input', label: 'Input', type: 'text' }];
  const [values, setValues] = useState<Record<string, string>>({});
  const { theme } = useTheme();

  const style = { ...theme.widgets.general, ...theme.widgets.form };

  const accent =
    theme.components.botMessage.accentColor ||
    theme.components.botMessage.backgroundColor ||
    style.accentColor ||
    theme.colors.accent;

  const textColor =
    theme.components.botMessage.textColor ||
    style.textColor ||
    theme.colors.textPrimary;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResponse(JSON.stringify(values)); // Send clean data
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-theme shadow-theme space-y-3 w-full max-w-xs border"
      style={{ backgroundColor: style.backgroundColor, borderColor: style.borderColor }}
    >
      <h4 className="text-sm font-bold mb-2" style={{ color: style.textColor }}>
        {data.title || "Please fill details"}
      </h4>

      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-xs font-medium" style={{ color: style.textColor }}>
            {field.label}
          </label>
          <input
            type={field.type}
            placeholder={field.placeholder}
            className="mt-1 block w-full rounded border p-1.5 text-sm"
            style={{ borderColor: theme.colors.neutral }}
            onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
            required
          />
        </div>
      ))}

      <button
        type="submit"
        className="w-full py-1.5 rounded text-sm font-semibold transition-colors"
        style={{
          backgroundColor: accent,
          color: textColor,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.filter = "brightness(1.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.filter = "brightness(1)";
        }}
      >
        Submit
      </button>
    </form>
  );
};
