import { useState, useCallback } from 'react';

interface HistoryState<T> {
  stack: T[];
  cursor: number;
}

export interface UseHistoryReturn<T> {
  current: T;
  push: (next: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useHistory<T>(initial: T, maxDepth = 50): UseHistoryReturn<T> {
  const [{ stack, cursor }, setState] = useState<HistoryState<T>>({
    stack: [initial],
    cursor: 0,
  });

  const push = useCallback((next: T) => {
    setState(({ stack, cursor }) => {
      const base = stack.slice(Math.max(0, cursor - maxDepth + 1), cursor + 1);
      return { stack: [...base, next], cursor: base.length };
    });
  }, [maxDepth]);

  const undo = useCallback(() => {
    setState(s => ({ ...s, cursor: Math.max(0, s.cursor - 1) }));
  }, []);

  const redo = useCallback(() => {
    setState(s => ({ ...s, cursor: Math.min(s.stack.length - 1, s.cursor + 1) }));
  }, []);

  return {
    current: stack[cursor],
    push,
    undo,
    redo,
    canUndo: cursor > 0,
    canRedo: cursor < stack.length - 1,
  };
}
