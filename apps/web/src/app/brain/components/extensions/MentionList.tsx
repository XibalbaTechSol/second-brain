import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Database } from 'lucide-react';

export const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback((index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.title });
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
            key={item.id}
            className={`flex items-center gap-3 w-full px-2 py-1.5 text-sm rounded-md transition-colors ${
              index === selectedIndex ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground hover:bg-muted'
            }`}
            onClick={() => selectItem(index)}
          >
            <div className={`p-1 rounded ${index === selectedIndex ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
              <Database className="w-3 h-3" />
            </div>
            <div className="text-left flex-1">
              <div className="font-medium truncate">{item.title}</div>
              <div className="text-[10px] opacity-60 uppercase font-bold tracking-widest">{item.type}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-muted-foreground italic">No matching memories...</div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';
