import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Container {
  id: number;
  name: string;
  description?: string;
  lists: any[];
}

interface AddContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContainer: (container: Omit<Container, 'id'>) => void;
  userRole: string;
  activeContainerType: string;
}

const AddContainerModal: React.FC<AddContainerModalProps> = ({
  isOpen,
  onClose,
  onAddContainer,
  userRole,
  activeContainerType
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a container name');
      return;
    }

    const newContainer: Omit<Container, 'id'> = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      lists: []
    };

    onAddContainer(newContainer);
    
    // Reset form
    setFormData({
      name: '',
      description: ''
    });
    
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Add New Container
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Container Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Container Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Disney Magic - March 2025 Sailing"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="e.g., Complete screening package for Eastern Caribbean cruise operations"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Containers are permission boundaries that can hold multiple lists of different types (passengers, crew, vendors, etc.). After creating the container, you can add specific lists within it.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              Create Container
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContainerModal;