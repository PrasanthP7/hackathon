import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { WidgetData } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  data: WidgetData;
  onResponse: (response: string) => void;
}

export const FeedbackWidget: React.FC<Props> = ({ data, onResponse }) => {
  const [rating, setRating] = useState(0);
  const { theme } = useTheme();

  const starColor =
    theme.components.botMessage.textColor || // nice contrast option
    theme.colors.accent;

  const bgColor =
    theme.components.botMessage.backgroundColor ||
    theme.colors.surface;

  const handleRate = (r: number) => {
    setRating(r);
    setTimeout(() => onResponse(`Rated: ${r} stars`), 600);
  };

  return (
    <div
      className="p-4 rounded-theme shadow-theme w-full max-w-xs text-center"
      style={{
        backgroundColor: bgColor,
        borderColor: theme.colors.neutral,
        borderWidth: '1px',
      }}
    >
      <h4
        className="text-sm font-semibold mb-3"
        style={{ color: theme.components.botMessage.textColor }}
      >
        {data.title || 'How was your experience?'}
      </h4>

      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => handleRate(s)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              size={28}
              fill={s <= rating ? starColor : 'none'}
              color={s <= rating ? starColor : '#aaa'}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
