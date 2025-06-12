import React from 'react';
import Input from '@/components/Input';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  colorClass?: string;
  showDecimals?: boolean;
}

const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  colorClass = 'text-lime-200',
  showDecimals = false,
}) => {
  const displayValue = showDecimals ? value.toFixed(step < 1 ? 2 : 0) : Math.round(value);

  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span dangerouslySetInnerHTML={{ __html: label }} />
        <span className={`${colorClass} font-mono`}>{displayValue}</span>
      </div>
      <Input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(v) => onChange(parseFloat(v))}
        compact
        centered
        disabled={disabled}
      />
    </div>
  );
};

export default SliderInput;