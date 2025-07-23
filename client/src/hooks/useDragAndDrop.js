import { useState } from 'react';

export const useDragAndDrop = (initialItems, onReorder) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.dataTransfer.setDragImage(e.target, 0, 0);
  };

  const handleDragOver = (e, item) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(item);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e, dropItem) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === dropItem.id) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const draggedIndex = initialItems.findIndex(item => item.id === draggedItem.id);
    const dropIndex = initialItems.findIndex(item => item.id === dropItem.id);

    if (draggedIndex !== -1 && dropIndex !== -1) {
      const newItems = [...initialItems];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, removed);
      
      onReorder(newItems);
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return {
    draggedItem,
    dragOverItem,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  };
};