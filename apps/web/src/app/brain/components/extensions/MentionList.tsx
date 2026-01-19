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
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden w-64 p-1 z-50">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            key={item.id}
            className={`flex items-center gap-3 w-full px-2 py-1.5 text-sm rounded-md transition-colors ${
              index === selectedIndex ? 'bg-indigo-50 text-indigo-900' : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => selectItem(index)}
          >
            <div className="bg-indigo-100 text-indigo-600 p-1 rounded">
              <Database className="w-3 h-3" />
            </div>
            <div className="text-left flex-1">
              <div className="font-medium truncate">{item.title}</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">{item.type}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-gray-500 italic">No matching memories...</div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';
