import React, { useState } from 'react';
import { X, Ship, Users, Briefcase, UserCheck, Building } from 'lucide-react';

interface List {
  name: string;
  type: 'sailing' | 'crew' | 'vendor' | 'guest' | 'visitor';
  description?: string;
  count: number;
  status: string;
  due_date?: string;
}

interface AddListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddList: (list: Omit<List, 'id'>) => Promise<void>;
  userRole: string;
  containerId: number;
  containerName: string;
}

const AddListModal: React.FC<AddListModalProps> = ({
  isOpen,
  onClose,
  onAddList,
  userRole,
  containerId,
  containerName
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'sailing' as const,
    description: '',
    count: 0,
    due_date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const getAvailableTypes = () => {
    switch(userRole) {
      case 'sailings':
        return ['sailing'];
      case 'sailingstaff':
        return ['crew'];
      case 'vendors':
        return ['vendor'];
      case 'frontdesk':
        return ['guest', 'visitor'];
      default:
        return ['sailing', 'crew', 'vendor', 'guest', 'visitor'];
    }
  };

  const typeIcons = {
    sailing: <Ship className="h-5 w-5" />,
    crew: <Users className="h-5 w-5" />,
    vendor: <Briefcase className="h-5 w-5" />,
    guest: <UserCheck className="h-5 w-5" />,
    visitor: <Building className="h-5 w-5" />
  };

  const typeLabels = {
    sailing: 'Sailing/Passenger Manifest',
    crew: 'Crew Group',
    vendor: 'Vendor Group',
    guest: 'Guest Group',
    visitor: 'Visitor Group'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a list name');
      return;
    }

    setIsSubmitting(true);

    try {
      await onAddList({
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || undefined,
        count: formData.count,
        status: 'pending',
        due_date: formData.due_date || undefined
      });

      // Reset form
      setFormData({
        name: '',
        type: 'sailing',
        description: '',
        count: 0,
        due_date: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding list:', error);
      alert('Failed to add list. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTypes = getAvailableTypes();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New List</h2>
            <p className="text-sm text-gray-500 mt-1">to {containerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* List Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List Type
            </label>
            <div className="space-y-2">
              {availableTypes.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <div className="text-gray-600 mr-2">
                      {typeIcons[type as keyof typeof typeIcons]}
                    </div>
                    <span className="text-sm font-medium">
                      {typeLabels[type as keyof typeof typeLabels]}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* List Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Bridge Officers, Port Services"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Optional description of this list"
            />
          </div>

          {/* Expected Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Count
            </label>
            <input
              type="number"
              value={formData.count}
              onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0"
              min="0"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListModal;