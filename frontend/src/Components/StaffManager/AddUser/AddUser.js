import React, { useState, useRef } from 'react'
import axios from 'axios'
import { Plus } from 'lucide-react'
import './AddUser.css'

const API_BASE = process.env.REACT_APP_STAFF_API_URL || 'http://localhost:5000';
const URL = `${API_BASE}/Users`;

function AddUser() {
  const [form, setForm] = useState({ name: '', gmail: '', age: '', address: '', photo: '', position: '' });
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const validate = () => {
    const errs = {};
    const name = (form.name || '').trim().replace(/\s+/g, ' ');
    const email = (form.gmail || '').trim().toLowerCase();
    const age = form.age === '' ? '' : Number(form.age);
    const address = (form.address || '').trim();
    const position = (form.position || '').trim();

    if (!name || name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email || !/^\S+@\S+\.[\S]+$/.test(email)) errs.gmail = 'Enter a valid email address';
    if (age === '' || !Number.isInteger(age) || age < 18 || age > 65) errs.age = 'Age must be 18-65';
    if (!address || address.length < 3) errs.address = 'Address is required';
    if (!position) errs.position = 'Select a position';
    return { errs, values: { name, email, age, address, position } };
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
    
    const { errs, values } = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setSubmitting(false);
      return;
    }

    try {
      // Build request as multipart if a file is selected, else JSON
      const hasFile = !!selectedFile;
      let body;
      let config = { timeout: 15000 };
      if (hasFile) {
        const fd = new FormData();
        fd.append('name', values.name);
        fd.append('gmail', values.email);
        fd.append('age', String(values.age));
        fd.append('address', values.address);
        fd.append('position', values.position);
        fd.append('photo', selectedFile);
        body = fd;
        // Let browser set multipart boundary automatically
      } else {
        body = {
          name: values.name,
          gmail: values.email,
          age: values.age,
          address: values.address,
          position: values.position,
          photo: form.photo || ''
        };
        config.headers = { 'Content-Type': 'application/json' };
      }

      try {
        await axios.post(URL, body, config);
      } catch (err) {
        if (API_BASE.includes('localhost')) {
          const fb = API_BASE.replace('localhost', '127.0.0.1');
          await axios.post(`${fb}/Users`, body, config);
        } else {
          throw err;
        }
      }
      
      // Reset form
      setForm({ name: '', gmail: '', age: '', address: '', photo: '', position: '' });
      if (photoPreviewUrl) {
        window.URL.revokeObjectURL(photoPreviewUrl);
        setPhotoPreviewUrl('');
      }
      setSelectedFile(null);
      setSuccess('Staff member added successfully!');
      
      // Dispatch event to update staff count
      window.dispatchEvent(new CustomEvent('staffAdded'));
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = err.response?.data?.message;
        if (status === 409 && msg) {
          setError(msg.includes('Email') ? 'Email already exists' : msg.includes('Name') ? 'Name already exists' : msg);
        } else if (status === 400 && msg) {
          setError(msg);
        } else {
          setError('Failed to add staff. Please try again.');
        }
      } else {
        setError('Failed to add staff. Please try again.');
      }
      console.error('Error adding staff:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (photoPreviewUrl) {
        window.URL.revokeObjectURL(photoPreviewUrl);
      }
      const localUrl = window.URL.createObjectURL(file);
      setPhotoPreviewUrl(localUrl);
      setSelectedFile(file);
    }
  };

  const clearPhoto = () => {
    if (photoPreviewUrl) {
      window.URL.revokeObjectURL(photoPreviewUrl);
      setPhotoPreviewUrl('');
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-zinc-900">Add New Staff Member</h2>
          <p className="text-sm text-zinc-500">Fill in the details below to register a new fire brigade staff member</p>
        </div>

        {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm text-zinc-700">Full Name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter full name"
              required
              className="h-11 w-full rounded-md border border-zinc-300 px-3 outline-none ring-blue-500 focus:ring-2"
            />
            {fieldErrors.name && <div className="mt-1 text-sm text-red-600">{fieldErrors.name}</div>}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-zinc-700">Email Address</label>
            <input
              id="email"
              type="email"
              value={form.gmail}
              onChange={(e) => setForm({ ...form, gmail: e.target.value })}
              placeholder="Enter email address"
              required
              className="h-11 w-full rounded-md border border-zinc-300 px-3 outline-none ring-blue-500 focus:ring-2"
            />
            {fieldErrors.gmail && <div className="mt-1 text-sm text-red-600">{fieldErrors.gmail}</div>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="age" className="mb-1 block text-sm text-zinc-700">Age</label>
              <input
                id="age"
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="Enter age"
                min="18"
                max="65"
                className="h-11 w-full rounded-md border border-zinc-300 px-3 outline-none ring-blue-500 focus:ring-2"
              />
              {fieldErrors.age && <div className="mt-1 text-sm text-red-600">{fieldErrors.age}</div>}
            </div>
            <div>
              <label htmlFor="position" className="mb-1 block text-sm text-zinc-700">Position</label>
              <select
                id="position"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                required
                className="h-11 w-full rounded-md border border-zinc-300 px-3"
              >
                <option value="" disabled>Select a position</option>
                <option value="Firefighters">Firefighters</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Equipment Technician">Equipment Technician</option>
                <option value="First Aid Officer">First Aid Officer</option>
                <option value="Pump Operator">Pump Operator</option>
                <option value="Safety Officer">Safety Officer</option>
              </select>
              {fieldErrors.position && <div className="mt-1 text-sm text-red-600">{fieldErrors.position}</div>}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="mb-1 block text-sm text-zinc-700">Address</label>
            <input
              id="address"
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Enter residential address"
              className="h-11 w-full rounded-md border border-zinc-300 px-3 outline-none ring-blue-500 focus:ring-2"
            />
            {fieldErrors.address && <div className="mt-1 text-sm text-red-600">{fieldErrors.address}</div>}
          </div>

          <div>
            <label htmlFor="photo" className="mb-1 block text-sm text-zinc-700">Profile Photo</label>
            <input
              id="photo"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              placeholder="Choose a photo"
              className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-700 hover:file:bg-zinc-200"
            />

            {photoPreviewUrl && (
              <div className="mt-2 flex items-center justify-between rounded-md border border-zinc-200 p-3">
                <div className="flex items-center gap-3">
                  <img src={photoPreviewUrl} alt="Preview" className="h-14 w-14 rounded-md object-cover" />
                  <div>
                    <div className="text-sm font-medium text-zinc-800">{selectedFile?.name || 'Photo'}</div>
                    <div className="text-xs text-zinc-500">{selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="rounded-md border border-red-300 bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  ✕ Remove
                </button>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              className={`inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60 ${submitting ? 'opacity-75' : ''}`}
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Staff...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddUser
