import React from 'react';
import { WidgetData } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  data: WidgetData;
  onResponse: (response: string) => void;
}

export const DropdownWidget: React.FC<Props> = ({ data, onResponse }) => {
  const options = data.options || [];
  const { theme } = useTheme();

  const style = { ...theme.widgets.general, ...theme.widgets.dropdown };

  return (
    <div
      className="p-3 rounded-theme shadow-theme w-full max-w-xs border"
      style={{ backgroundColor: style.backgroundColor, borderColor: style.borderColor }}
    >
      <label className="block text-xs font-medium mb-1" style={{ color: style.textColor }}>
        {data.title || "Choose an option"}
      </label>

      <select
        onChange={(e) => {
          const selected = options.find(
            (opt: any) =>
              (typeof opt === "string" ? opt : opt.value) === e.target.value
          );

          const label =
            typeof selected === "string"
              ? selected
              : selected?.label;

          onResponse(label || "");
        }}
        className="block w-full text-sm rounded-md shadow-sm p-2 border"
        style={{
          borderColor: theme.colors.neutral,
          color: style.textColor,
        }}
        defaultValue=""
      >
        <option value="" disabled>Select...</option>

        {options.map((opt: any, index: number) => {
          const label = typeof opt === "string" ? opt : opt.label;
          const value = typeof opt === "string" ? opt : opt.value;
          return (
            <option key={value || index} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};
