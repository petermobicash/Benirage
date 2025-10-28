import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Save, X, Plus, Trash2, Eye, EyeOff, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';

interface FormFieldData {
  id: string;
  page_id: string;
  field_type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options: string[];
  validation_rules: Record<string, unknown>;
  order_index: number;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

const FormFieldManager = () => {
  const [formFields, setFormFields] = useState<FormFieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    page_id: '',
    field_type: 'text',
    label: '',
    placeholder: '',
    required: false,
    options: [] as string[],
    validation_rules: {},
    order_index: 0,
    is_active: true,
    status: 'published'
  });
  const { showToast } = useToast();

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Number' },
    { value: 'url', label: 'URL' },
    { value: 'file', label: 'File Upload' }
  ];

  const pages = [
    { value: 'contact', label: 'Contact Form' },
    { value: 'membership', label: 'Membership Application' },
    { value: 'volunteer', label: 'Volunteer Application' },
    { value: 'partnership', label: 'Partnership Application' },
    { value: 'donation', label: 'Donation Form' },
    { value: 'newsletter', label: 'Newsletter Signup' }
  ];

  const fetchFormFields = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('form_fields')
        .select('*')
        .order('page_id', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      setFormFields(data || []);
    } catch (error) {
      console.error('Error fetching form fields:', error);
      showToast('Failed to load form fields', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFormFields();
  }, [fetchFormFields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('form_fields')
          .update({
            ...formData,
            updated_by: 'Current User' // Replace with actual user
          })
          .eq('id', editingId);

        if (error) throw error;
        showToast('Form field updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('form_fields')
          .insert({
            ...formData,
            updated_by: 'Current User' // Replace with actual user
          });

        if (error) throw error;
        showToast('Form field created successfully', 'success');
      }

      resetForm();
      fetchFormFields();
    } catch (error) {
      console.error('Error saving form field:', error);
      showToast('Failed to save form field', 'error');
    }
  };

  const handleEdit = (field: FormFieldData) => {
    setFormData({
      page_id: field.page_id,
      field_type: field.field_type,
      label: field.label,
      placeholder: field.placeholder || '',
      required: field.required,
      options: field.options,
      validation_rules: field.validation_rules,
      order_index: field.order_index,
      is_active: field.is_active,
      status: field.status
    });
    setEditingId(field.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form field?')) return;

    try {
      const { error } = await supabase
        .from('form_fields')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Form field deleted successfully', 'success');
      fetchFormFields();
    } catch (error) {
      console.error('Error deleting form field:', error);
      showToast('Failed to delete form field', 'error');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('form_fields')
        .update({ 
          is_active: !isActive,
          updated_by: 'Current User' // Replace with actual user
        })
        .eq('id', id);

      if (error) throw error;
      showToast(`Form field ${!isActive ? 'activated' : 'deactivated'}`, 'success');
      fetchFormFields();
    } catch (error) {
      console.error('Error toggling form field status:', error);
      showToast('Failed to update form field status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      page_id: '',
      field_type: 'text',
      label: '',
      placeholder: '',
      required: false,
      options: [],
      validation_rules: {},
      order_index: 0,
      is_active: true,
      status: 'published'
    });
    setEditingId(null);
  };

  const handleOptionsChange = (value: string) => {
    const options = value.split('\n').filter(option => option.trim() !== '');
    setFormData({ ...formData, options });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Form Field Manager</h1>
        <Button onClick={() => setEditingId('new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </Button>
      </div>

      {/* Form */}
      {(editingId === 'new' || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId === 'new' ? 'Add New Field' : 'Edit Field'}
            </h2>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Form Page"
                type="select"
                value={formData.page_id}
                onChange={(value) => setFormData({ ...formData, page_id: value as string })}
                required
                options={pages}
              />

              <FormField
                label="Field Type"
                type="select"
                value={formData.field_type}
                onChange={(value) => setFormData({ ...formData, field_type: value as string })}
                required
                options={fieldTypes}
              />

              <FormField
                label="Label"
                type="text"
                value={formData.label}
                onChange={(value) => setFormData({ ...formData, label: value as string })}
                required
              />

              <FormField
                label="Placeholder"
                type="text"
                value={formData.placeholder}
                onChange={(value) => setFormData({ ...formData, placeholder: value as string })}
                placeholder="Optional placeholder text"
              />

              <FormField
                label="Order Index"
                type="number"
                value={formData.order_index}
                onChange={(value) => setFormData({ ...formData, order_index: parseInt(value as string) || 0 })}
                min="0"
              />

              <FormField
                label="Status"
                type="select"
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value as string })}
                options={[
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'archived', label: 'Archived' }
                ]}
              />
            </div>

            {/* Options for select/radio fields */}
            {(formData.field_type === 'select' || formData.field_type === 'radio') && (
              <FormField
                label="Options (one per line)"
                type="textarea"
                value={formData.options.join('\n')}
                onChange={(value) => handleOptionsChange(value as string)}
                rows={4}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            )}

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={formData.required}
                  onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="required" className="text-sm font-medium text-gray-700">
                  Required Field
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingId === 'new' ? 'Create' : 'Update'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Fields List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Form
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Label
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Required
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formFields.map((field) => (
              <tr key={field.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {pages.find(p => p.value === field.page_id)?.label || field.page_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {field.label}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fieldTypes.find(t => t.value === field.field_type)?.label || field.field_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    field.required 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {field.required ? 'Required' : 'Optional'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {field.order_index}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    field.is_active && field.status === 'published'
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {field.is_active ? field.status : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(field)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(field.id, field.is_active)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    {field.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(field.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formFields.length === 0 && (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">No form fields found</p>
          <p className="text-gray-500 mb-4">Create your first form field to get started</p>
          <Button onClick={() => setEditingId('new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>
      )}
    </div>
  );
};

export default FormFieldManager;