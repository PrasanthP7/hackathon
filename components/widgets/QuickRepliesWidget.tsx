import React from "react";
import { WidgetData } from "../../types";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  data: WidgetData;
  onResponse: (response: string) => void;
}
export const QuickRepliesWidget: React.FC<Props> = ({ data, onResponse }) => {
  const options = data.options || [{ title: "Yes", value: "yes" }];
  const { theme } = useTheme();

  const style = { ...theme.widgets.general, ...theme.widgets.quickReplies };

  const accent =
    style.accentColor ||
    theme.components.botMessage.textColor ||
    theme.colors.textPrimary;

  const bg =
    style.backgroundColor ||
    theme.components.botMessage.backgroundColor ||
    theme.colors.surface;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((opt, index) => {
        const label = typeof opt === "string" ? opt : opt.title;
        return (
          <button
            key={label + index}
            onClick={() => onResponse(label)}
            className="px-3 py-1.5 text-sm font-medium rounded-full transition-colors shadow-sm border"
            style={{
              backgroundColor: bg,
              borderColor: accent,
              color: accent
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = accent;
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = bg;
              e.currentTarget.style.color = accent;
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

