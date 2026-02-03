import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { handleApiError, handleApiSuccess } from '../../utils/notifications';
import NavigationBar from './src/Components/NavigationBar';

export default function InventoryCategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', quantity: 0, condition: 'Good', serialNumber: '', assignedToVehicle: '', location: 'Station', notes: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemId, setNewItemId] = useState('');
  const [showFloatingBackButton, setShowFloatingBackButton] = useState(false);

  const [form, setForm] = useState({
    name: '',
    model: '',
    brand: '',
    serialNumber: '',
    quantity: '',
    condition: 'Good',
    lastInspection: '',
    nextInspection: '',
    assignedToVehicle: '',
    location: 'Station',
    notes: ''
  });

  const conditions = useMemo(() => ['Pending Inspection','Good','Excellent','Fair','Poor','Out of Service'], []);

  // Generate a readable temporary Item ID for UI display
  const generateItemId = (categorySlug) => {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${(categorySlug || 'ITEM').toString().toUpperCase()}-${ts}-${rnd}`;
  };

  // Suitable item names per category
  const ITEM_NAMES_BY_CATEGORY = useMemo(() => ({
    'ppe': [
      'Turnout Coat','Turnout Pants','Fire Helmet','Fire Boots','Fire Gloves','Nomex Hood','Safety Glasses','Safety Vest'
    ],
    'respiratory': [
      'SCBA Harness','SCBA Cylinder','Facepiece','Regulator','PAPR Unit','Airline Hose'
    ],
    'hose-water': [
      '1.5" Attack Hose','2.5" Supply Hose','Hose Nozzle','Wye Valve','Hose Clamp','Hydrant Wrench'
    ],
    'ladders': [
      '24ft Extension Ladder','14ft Roof Ladder','Attic Ladder','Ladder Roof Hook'
    ],
    'entry-tools': [
      'Halligan Bar','Flathead Axe','Sledge Hammer','Pry Bar','Bolt Cutters'
    ],
    'power-tools': [
      'Ventilation Saw','Circular Saw','Reciprocating Saw','Generator','Positive Pressure Fan'
    ],
    'extrication': [
      'Hydraulic Cutter','Hydraulic Spreader','Rams','Stabilization Struts','Glass Management Kit'
    ],
    'rope-rescue': [
      'Rescue Rope','Prusik Cord','Pulley','Descender','Harness','Carabiner'
    ],
    'hazmat': [
      'Level A Suit','Level B Suit','Detection Meter','Decon Shower','Absorbent Pads'
    ],
    'ems-medical': [
      'Trauma Kit','Oxygen Cylinder','BVM','AED','Spine Board','Cervical Collar'
    ],
    'communications': [
      'Portable Radio','Mobile Radio','Radio Battery','Speaker Mic','Headset'
    ],
    'apparatus': [
      'Crosslay Assembly','Deck Gun','Portable Monitor','Tool Mount','Scene Lighting'
    ],
    'station-facilities': [
      'Fire Extinguisher','Washer Extractor','Dryer','Gear Rack','Station Generator'
    ],
    'training': [
      'Training Hose','Cones','Dummy/Manikin','Prop Kit','Classroom Projector'
    ],
    'water-supply-rural': [
      'Portable Tank','Suction Hose','Jet Siphon','Strainer','Dump Tank'
    ]
  }), []);

  const conditionBadgeClass = (cond) => {
    switch (cond) {
      case 'Pending Inspection':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-300';
      case 'Excellent':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Good':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200';
      case 'Fair':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-yellow-50 text-yellow-800 border-yellow-300';
      case 'Poor':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-orange-50 text-orange-700 border-orange-300';
      case 'Out of Service':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-red-50 text-red-700 border-red-200';
      default:
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [categoriesResp, itemsResp] = await Promise.all([
          apiService.getCategories(),
          apiService.getItems({ category: slug })
        ]);

        const categories = categoriesResp.data || [];
        const current = categories.find(c => c.slug === slug) || null;
        const list = itemsResp.items || itemsResp.data || [];

        if (mounted) {
          setCategory(current);
          setItems(list);
        }
      } catch (e) {
        setError(handleApiError(e, 'Failed to load items'));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [slug]);

  // Scroll detection for floating back button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      // Show floating button when scrolled down more than 200px
      setShowFloatingBackButton(scrollTop > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const refresh = async () => {
    try {
      const r = await apiService.getItems({ category: slug });
      setItems(r.items || r.data || []);
    } catch (e) {
      handleApiError(e, 'Failed to refresh items');
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'quantity' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        model: form.model || '',
        brand: form.brand || '',
        serialNumber: form.serialNumber || '',
        quantity: form.quantity === '' ? 0 : Number(form.quantity) || 0,
        condition: 'Pending Inspection',
        categorySlug: slug
      };
      await apiService.createItem(payload);
      handleApiSuccess('Item created');
      setForm({ name: '', model: '', brand: '', serialNumber: '', quantity: '', condition: 'Good', lastInspection: '', nextInspection: '', assignedToVehicle: '', location: 'Station', notes: '' });
      await refresh();
      setShowAddForm(false);
    } catch (e) {
      handleApiError(e, 'Failed to create item');
    } finally {
      setSaving(false);
    }
  };

  const onUpdate = async (id, patch) => {
    try {
      await apiService.updateItem(id, patch);
      handleApiSuccess('Item updated');
      await refresh();
    } catch (e) {
      handleApiError(e, 'Failed to update item');
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this item permanently?')) return;
    try {
      await apiService.deleteItem(id);
      handleApiSuccess('Item deleted');
      await refresh();
    } catch (e) {
      handleApiError(e, 'Failed to delete item');
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      name: item.name || '',
      quantity: item.quantity || 0,
      condition: item.condition || 'Good',
      serialNumber: item.serialNumber || '',
      assignedToVehicle: item.assignedToVehicle || '',
      location: item.location || 'Station',
      notes: item.notes || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    try {
      await onUpdate(id, { ...editForm });
      setEditingId(null);
    } catch (_) {}
  };

  const onClearAll = async () => {
    if (!window.confirm(`This will delete ALL items in ${category?.name}. Continue?`)) return;
    try {
      const res = await apiService.clearItems(slug);
      handleApiSuccess(`Deleted ${res?.deletedCount ?? 0} items`);
      await refresh();
    } catch (e) {
      handleApiError(e, 'Failed to clear items');
    }
  };

  const goBack = () => navigate('/station-officer/inventory');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading {slug}...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto bg-white border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Category not found</h2>
          <p className="text-gray-600 mb-4">The requested category "{slug}" does not exist.</p>
          <button onClick={goBack} className="px-4 py-2 bg-blue-600 text-white rounded-md">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header - hidden when floating button is shown */}
      <div className={`sticky top-16 z-40 bg-gray-50/80 backdrop-blur transition-opacity duration-300 ${showFloatingBackButton ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <button
            onClick={() => navigate('/station-officer/inventory')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <span>←</span>
            <span>Back to Categories</span>
          </button>
        </div>
      </div>

      {/* Floating back button - appears when scrolled down */}
      {showFloatingBackButton && (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out">
          <button
            onClick={() => navigate('/station-officer/inventory')}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white text-gray-700 hover:bg-gray-50 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
          >
            <span className="text-lg">←</span>
            <span className="font-medium">Back to Categories</span>
          </button>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="rounded-xl shadow bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 text-white text-center px-6 py-10">
          <h1 className="text-4xl font-black mb-3">{category.name}</h1>
          <p className="opacity-90 mb-6">Manage {category.name.toLowerCase()} inventory</p>
          <button onClick={() => { setNewItemId(generateItemId(slug)); setShowAddForm(true); }} className="mx-auto px-6 py-3 rounded-md bg-emerald-600 hover:bg-emerald-700 shadow-lg">
            Add New Item
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddForm(false)}>
            <div className="bg-white border rounded-xl shadow-xl w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Add New Item</h2>
                <button onClick={() => setShowAddForm(false)} className="px-2 py-1 text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                <input value={newItemId} readOnly className="border rounded-md px-3 py-2 bg-gray-50" placeholder="Item ID" />
                <input value={category.name} readOnly className="border rounded-md px-3 py-2 bg-gray-50" placeholder="Category" />
                <select name="name" value={form.name} onChange={onChange} required className="border rounded-md px-3 py-2 md:col-span-2">
                  <option value="">Select Item Name</option>
                  {(ITEM_NAMES_BY_CATEGORY[slug] || ['General Item']).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <input name="model" value={form.model} onChange={onChange} placeholder="Model" className="border rounded-md px-3 py-2" />
                <input name="brand" value={form.brand} onChange={onChange} placeholder="Brand" className="border rounded-md px-3 py-2" />
                <input name="serialNumber" value={form.serialNumber} onChange={onChange} placeholder="Serial/Lot" className="border rounded-md px-3 py-2 md:col-span-2" />
                <input name="quantity" type="number" min="0" value={form.quantity} onChange={onChange} placeholder="Quantity" className="border rounded-md px-3 py-2 w-full bg-gray-50 focus:bg-white" />
                <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                  <button disabled={saving} type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md disabled:opacity-60">{saving ? 'Saving...' : 'Add Item'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section className="bg-white border rounded-xl">
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Item ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Serial/Lot</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Last Inspection</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Next Inspection</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length === 0 && (
                  <tr>
                    <td className="px-6 py-4 text-gray-500" colSpan={10}>No items found.</td>
                  </tr>
                )}
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700 break-words">{item.itemID || item.serialNumber || (item._id ? `ID-${String(item._id).slice(-6).toUpperCase()}` : '')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">
                      {editingId === item._id ? (
                        <input className="border rounded px-2 py-1 w-full" value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} />
                      ) : item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 break-words">
                      {editingId === item._id ? (
                        <input className="border rounded px-2 py-1 w-full" value={editForm.model} onChange={e=>setEditForm(f=>({...f,model:e.target.value}))} />
                      ) : (item.model || '-')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 break-words">
                      {editingId === item._id ? (
                        <input className="border rounded px-2 py-1 w-full" value={editForm.brand} onChange={e=>setEditForm(f=>({...f,brand:e.target.value}))} />
                      ) : (item.brand || '-')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 break-words">
                      {editingId === item._id ? (
                        <input className="border rounded px-2 py-1 w-36" value={editForm.serialNumber} onChange={e=>setEditForm(f=>({...f,serialNumber:e.target.value}))} />
                      ) : (item.serialNumber || '-')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 break-words">
                      {editingId === item._id ? (
                        <input type="number" className="border rounded px-2 py-1 w-24" value={editForm.quantity} onChange={e=>setEditForm(f=>({...f,quantity:Number(e.target.value)}))} />
                      ) : (item.quantity ?? 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 break-words">
                      {editingId === item._id ? (
                        <select className="border rounded px-2 py-1" value={editForm.condition} onChange={e=>setEditForm(f=>({...f,condition:e.target.value}))}>
                          {conditions.map(c=> <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <span className={conditionBadgeClass(item.condition)}>{item.condition}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 break-words">
                      {item.condition === 'Pending Inspection' ? '-' : 
                        (item.lastInspection ? new Date(item.lastInspection).toISOString().slice(0,10) : '-')
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 break-words">
                      {item.condition === 'Pending Inspection' ? '-' :
                        (item.nextInspection ? new Date(item.nextInspection).toISOString().slice(0,10) : '-')
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === item._id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={()=>saveEdit(item._id)} className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm">Save</button>
                          <button onClick={cancelEdit} className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => startEdit(item)} className="px-2 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded">Edit</button>
                          <button onClick={() => onDelete(item._id)} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}


