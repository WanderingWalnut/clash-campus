import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { RankChangeType } from '@/types/rankings';

interface RankChangeProps {
  /** The direction of rank change */
  type: RankChangeType;
  /** Optional: The number of positions changed */
  amount?: number;
}

/**
 * Displays a visual indicator for rank movement (up, down, or unchanged).
 * Shows an arrow icon with optional position change amount.
 *
 * @param type - The direction of rank change ('up' | 'down' | 'same')
 * @param amount - Optional number of positions changed (number)
 */
export function RankChange({ type, amount }: RankChangeProps) {
  if (type === 'up') {
    return (
      <div className="flex items-center text-green-400 text-xs font-bold">
        <ArrowUp size={12} />
        {amount !== undefined && <span className="ml-0.5">{amount}</span>}
      </div>
    );
  }

  if (type === 'down') {
    return (
      <div className="flex items-center text-red-400 text-xs font-bold">
        <ArrowDown size={12} />
        {amount !== undefined && <span className="ml-0.5">{amount}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center text-gray-600 text-xs font-bold">
      <Minus size={12} />
    </div>
  );
}

