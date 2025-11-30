import React from "react";
import { WidgetData } from "../../types";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  data: WidgetData;
  onResponse: (response: string) => void;
}

export const CarouselWidget: React.FC<Props> = ({ data, onResponse }) => {
  const items = data.items || [];
  const { theme } = useTheme();

  const style = { ...theme.widgets.general, ...theme.widgets.carousel };

  const accent =
    theme.components.botMessage.accentColor ||
    theme.components.botMessage.backgroundColor ||
    style.accentColor ||
    theme.colors.accent;

  const textColor =
    theme.components.botMessage.textColor ||
    style.textColor ||
    theme.colors.textPrimary;

  return (
    <div className="flex overflow-x-auto gap-3 py-2 px-1 max-w-full no-scrollbar">
      {items.map((item, index) => {
        const label = item.actions?.[0]?.text || "Select";
        const value =
          item.actions?.[0]?.value || item.id || item.title || index;

        return (
          <div
            key={item.id || index}
            className="flex-none w-40 rounded-theme shadow-theme overflow-hidden border flex flex-col"
            style={{
              backgroundColor: style.backgroundColor,
              borderColor: style.borderColor,
            }}
          >
            <div className="h-24 bg-gray-200 w-full relative">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-2 flex-1 flex flex-col">
              <h5
                className="text-sm font-bold truncate"
                style={{ color: style.textColor }}
              >
                {item.title}
              </h5>

              <p
                className="text-xs opacity-70 line-clamp-2 mb-2 flex-1"
                style={{ color: textColor }}
              >
                {item.description || item.subtitle}
              </p>

              <button
                onClick={() => onResponse(value)}
                className="w-full mt-auto py-1 text-xs font-semibold rounded transition-colors"
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
                {label}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
