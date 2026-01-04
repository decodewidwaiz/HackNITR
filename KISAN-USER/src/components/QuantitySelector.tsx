import { Plus, Minus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function QuantitySelector({ 
  quantity, 
  onQuantityChange, 
  min = 1, 
  max = 100,
  disabled = false
}: QuantitySelectorProps) {
  const increment = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  const decrement = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= min && value <= max) {
      onQuantityChange(value);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700">Qty:</span>
      <div className="flex items-center border border-gray-300 rounded-lg bg-white">
        <button
          onClick={decrement}
          disabled={quantity <= min || disabled}
          className="p-2 text-gray-600 hover:text-green-700 hover:bg-gray-50 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="h-3 w-3" />
        </button>
        
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={min}
          max={max}
          disabled={disabled}
          className="w-12 text-center border-0 focus:ring-0 focus:outline-none text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        
        <button
          onClick={increment}
          disabled={quantity >= max || disabled}
          className="p-2 text-gray-600 hover:text-green-700 hover:bg-gray-50 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}