import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, MoreHorizontal, GripVertical, X, Maximize2, ExternalLink } from 'lucide-react';
import { formatToMMDDYYYY, formatToISO } from '@/lib/date-utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Editor } from '../editor/Editor';

interface Property {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multi-select' | 'date';
}

interface Row {
  id: string;
  content?: string;
  [key: string]: any;
}

interface TableViewProps {
  properties: Property[];
  data: Row[];
  onUpdateRow?: (id: string, updates: any) => void;
  onReorder?: (newData: Row[]) => void;
  onCreateRow?: () => void;
  onOpenPage?: (row: Row) => void;
}

const SortableRow = ({ row, properties, editingCell, setEditingCell, editValue, setEditValue, handleBlur, handleKeyDown, inputRef, onOpenPage, onUpdateRow }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: row.id });

  const handleRemoveTag = (propId: string, tagToRemove: string) => {
    const currentTags = row[propId] || [];
    const newTags = currentTags.filter((t: string) => t !== tagToRemove);
    onUpdateRow?.(row.id, { [propId]: newTags });
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      className="group hover:bg-muted/50 transition-colors h-10 border-b border-border"
    >
      <td className="w-8 pl-2 text-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
      </td>
      {properties.map((prop: any, propIndex: number) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.propId === prop.id;
        const isName = prop.id === 'name';

        return (
          <td
            key={`${row.id}-${prop.id}`}
            className="px-3 py-1 border-r border-border last:border-r-0 relative cursor-text min-w-[150px]"
            onClick={() => !isEditing && (isName ? onOpenPage(row) : setEditingCell({ rowId: row.id, propId: prop.id }))}
          >
            <div className={`truncate max-w-[300px] text-foreground min-h-[20px] flex items-center ${isName ? 'font-medium hover:underline cursor-pointer' : ''}`}>
              {isEditing ? (
                prop.type === 'select' || prop.id === 'status' ? (
                  <select
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    className="w-full h-full bg-card outline-none px-1 rounded shadow-sm border border-primary text-sm text-foreground"
                  >
                    {/* Common Options */}
                    {prop.id === 'status' && (
                      <>
                        <option value="Active">Active</option>
                        <option value="OnHold">OnHold</option>
                        <option value="Completed">Completed</option>
                        <option value="Archive">Archive</option>
                      </>
                    )}
                    {prop.id === 'priority' || prop.id === 'importance' || prop.id === 'potential' ? (
                      <>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </>
                    ) : null}
                    {prop.id === 'riskLevel' && (
                      <>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </>
                    )}
                    {/* Fallback for other selects */}
                    {!(prop.id === 'status' || prop.id === 'priority' || prop.id === 'importance' || prop.id === 'potential' || prop.id === 'riskLevel') && (
                      <>
                        <option value={editValue}>{editValue}</option>
                        <option value="Option 1">Option 1</option>
                        <option value="Option 2">Option 2</option>
                      </>
                    )}
                  </select>
                ) : (
                  <input
                    ref={inputRef}
                    type={prop.type === 'date' ? 'date' : 'text'}
                    value={prop.type === 'date' ? formatToISO(editValue) : editValue}
                    autoFocus
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full bg-card outline-none px-1 rounded shadow-sm border border-primary text-sm text-foreground"
                    placeholder={prop.type === 'multi-select' ? "Tag1, Tag2..." : ""}
                  />
                )
              ) : (
                renderCell(prop, row[prop.id], (tag) => handleRemoveTag(prop.id, tag))
              )}
            </div>
          </td>
        );
      })}
      <td className="w-10 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        <div className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded inline-block">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </div>
      </td>
    </tr>
  );
};

export const TableView: React.FC<TableViewProps> = ({ properties, data, onUpdateRow, onReorder, onCreateRow, onOpenPage }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowId: string, propId: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activePage, setActivePage] = useState<Row | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editingCell) {
      const row = data.find(r => r.id === editingCell.rowId);
      const val = row ? row[editingCell.propId] : '';
      setEditValue(Array.isArray(val) ? val.join(', ') : (val || ''));
    }
  }, [editingCell, data]);

  const handleBlur = () => {
    if (editingCell) {
      const prop = properties.find(p => p.id === editingCell.propId);
      let finalValue: any = editValue;
      if (prop?.type === 'multi-select') {
        finalValue = editValue.split(',').map(s => s.trim()).filter(s => s);
      } else if (prop?.type === 'date') {
        finalValue = formatToMMDDYYYY(editValue);
      }
      onUpdateRow?.(editingCell.rowId, { [editingCell.propId]: finalValue });
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') setEditingCell(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.findIndex((r) => r.id === active.id);
      const newIndex = data.findIndex((r) => r.id === over.id);
      onReorder?.(arrayMove(data, oldIndex, newIndex));
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {isMounted && (
        <div className="w-full overflow-x-auto border-t border-border flex-1">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="min-w-full text-left text-sm border-collapse">
              <thead className="bg-muted/30 sticky top-0 z-10">
                <tr className="border-b border-border h-10">
                  <th className="w-8"></th>
                  {properties.map((prop) => (
                    <th key={prop.id} className="px-3 py-2 font-normal text-muted-foreground border-r border-border last:border-r-0 hover:bg-muted/50 cursor-pointer select-none">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold opacity-50">{prop.type}</span>
                        <span>{prop.name}</span>
                      </div>
                    </th>
                  ))}
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="bg-background">
                <SortableContext items={data.map(r => r.id)} strategy={verticalListSortingStrategy}>
                  {data.map((row) => (
                    <SortableRow 
                      key={row.id} 
                      row={row} 
                      properties={properties} 
                      editingCell={editingCell}
                      setEditingCell={setEditingCell}
                      editValue={editValue}
                      setEditValue={setEditValue}
                      handleBlur={handleBlur}
                      handleKeyDown={handleKeyDown}
                      inputRef={inputRef}
                      onOpenPage={onOpenPage || setActivePage}
                      onUpdateRow={onUpdateRow}
                    />
                  ))}
                </SortableContext>
                <tr 
                  className="hover:bg-muted/30 cursor-pointer h-10 group"
                  onClick={onCreateRow}
                >
                  <td colSpan={properties.length + 2} className="px-10 text-muted-foreground flex items-center gap-2 select-none h-full py-3">
                    <Plus className="w-4 h-4" />
                    <span className="group-hover:text-foreground transition-colors font-medium">New</span>
                  </td>
                </tr>
              </tbody>

            </table>
          </DndContext>
        </div>
      )}
    </div>
  );
};

const renderCell = (property: Property, value: any, onRemoveTag?: (tag: string) => void) => {
  if (!value && value !== 0) return <span className="text-muted-foreground/40 italic">Empty</span>;

  switch (property.type) {
    case 'multi-select':
      return (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(value) && value.map((tag: string, tagIdx: number) => (
            <span
              key={`${tag}-${tagIdx}`}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary border border-primary/20 group/tag"
            >
              <span>{tag}</span>
              {onRemoveTag && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTag(tag);
                  }}
                  className="opacity-0 group-hover/tag:opacity-100 hover:bg-primary/20 rounded-sm p-0.25 transition-all"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      );
    case 'select':
      return (
        <span className="px-1.5 py-0.5 rounded text-xs bg-aurora-green/10 text-aurora-green border border-aurora-green/20">
          {value}
        </span>
      );
    case 'date':
      return (
        <span className="text-xs">
          {formatToMMDDYYYY(value)}
        </span>
      );
    default:
      return value;
  }
};
