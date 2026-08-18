import { useEffect, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { sessionService } from '../services/session.service';

const formatSlotTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export default function AvailabilityManager() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const fetchSlots = async () => {
    try {
      const data = await sessionService.getMyAvailability();
      setSlots(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setError('');
    if (!startTime || !endTime) return;

    try {
      await sessionService.addAvailability(new Date(startTime).toISOString(), new Date(endTime).toISOString());
      setStartTime('');
      setEndTime('');
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slot');
    }
  };

  const handleRemoveSlot = async (slotId) => {
    try {
      await sessionService.removeAvailability(slotId);
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove slot');
    }
  };

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading availability...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Availability</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAddSlot} className="flex flex-wrap items-end gap-3 mb-6 bg-[#282c3a] rounded-lg p-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Start</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="bg-[#1a1c23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">End</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="bg-[#1a1c23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded-lg text-sm"
        >
          <Plus size={16} /> Add slot
        </button>
      </form>

      {slots.length === 0 ? (
        <p className="text-gray-400 text-sm">No availability slots yet — add one above so mentees can book a session with you.</p>
      ) : (
        <div className="space-y-2">
          {slots.map((slot) => (
            <div key={slot._id} className="flex items-center justify-between bg-[#282c3a] rounded-lg px-4 py-3">
              <span className="text-sm text-gray-200">
                {formatSlotTime(slot.startTime)} – {new Date(slot.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  slot.status === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-purple-500/10 text-purple-400'
                }`}>
                  {slot.status === 'open' ? 'Open' : 'Booked'}
                </span>
                {slot.status === 'open' && (
                  <button
                    onClick={() => handleRemoveSlot(slot._id)}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="Remove slot"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
