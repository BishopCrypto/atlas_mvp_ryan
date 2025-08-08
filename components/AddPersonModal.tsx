import React, { useState } from 'react';
import { X, User } from 'lucide-react';

interface ListMember {
  name: string;
  email?: string;
  phone?: string;
  identification_number?: string;
  date_of_birth?: string;
  nationality?: string;
  notes?: string;
}

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPerson: (person: ListMember) => Promise<void>;
  listName: string;
  listType: string;
}

const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  onAddPerson,
  listName,
  listType
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    identification_number: '',
    date_of_birth: '',
    nationality: '',
    notes: ''
  });
  const [runScreening, setRunScreening] = useState(true); // Default to run screening
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const getFieldLabels = () => {
    switch(listType) {
      case 'sailing':
        return {
          name: 'Passenger Name',
          identification_number: 'Passport/ID Number',
          placeholder: 'e.g. John Smith'
        };
      case 'crew':
        return {
          name: 'Crew Member Name',
          identification_number: 'Employee ID/Passport',
          placeholder: 'e.g. Maria Rodriguez'
        };
      case 'vendor':
        return {
          name: 'Vendor Representative',
          identification_number: 'Company ID/License',
          placeholder: 'e.g. Port Services LLC'
        };
      case 'guest':
        return {
          name: 'Guest Name',
          identification_number: 'ID Number',
          placeholder: 'e.g. Alice Johnson'
        };
      case 'visitor':
        return {
          name: 'Visitor Name',
          identification_number: 'Visitor Pass/ID',
          placeholder: 'e.g. Bob Wilson'
        };
      default:
        return {
          name: 'Name',
          identification_number: 'ID Number',
          placeholder: 'e.g. John Doe'
        };
    }
  };

  const labels = getFieldLabels();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }

    setIsSubmitting(true);

    try {
      await onAddPerson({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        identification_number: formData.identification_number.trim() || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        nationality: formData.nationality.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        runScreening: runScreening
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        identification_number: '',
        date_of_birth: '',
        nationality: '',
        notes: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding person:', error);
      alert('Failed to add person. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-indigo-600" />
              Add Person
            </h2>
            <p className="text-sm text-gray-500 mt-1">to {listName}</p>
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
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {labels.name} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={labels.placeholder}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="email@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* ID Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {labels.identification_number}
            </label>
            <input
              type="text"
              value={formData.identification_number}
              onChange={(e) => setFormData(prev => ({ ...prev, identification_number: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="A1234567890"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="USA"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Additional notes or comments"
            />
          </div>

          {/* Screening Options */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="runScreening"
                checked={runScreening}
                onChange={(e) => setRunScreening(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="runScreening" className="text-sm text-gray-700">
                <span className="font-medium">Run screening now</span>
                <span className="block text-xs text-gray-500 mt-1">
                  Automatically check this person against Atlas security databases
                </span>
              </label>
            </div>
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
              {isSubmitting ? 'Adding...' : 'Add Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPersonModal;