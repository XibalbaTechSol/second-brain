import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Quote, Code, Image as ImageIcon } from 'lucide-react';

export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback((index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  }, [props]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="bg-card rounded-lg shadow-xl border border-border overflow-hidden w-64 p-1 z-50">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            key={index}
            className={`flex items-center gap-3 w-full px-2 py-1.5 text-sm rounded-md transition-colors ${
              index === selectedIndex ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground hover:bg-muted'
            }`}
            onClick={() => selectItem(index)}
          >
            <div className={`p-1 rounded shadow-sm border ${index === selectedIndex ? 'bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground' : 'bg-background border-border text-primary'}`}>
              {item.icon}
            </div>
            <div className="text-left">
              <div className="font-medium">{item.title}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-muted-foreground">No result</div>
      )}
    </div>
  );
});

CommandList.displayName = 'CommandList';
