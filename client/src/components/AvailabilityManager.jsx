import { useEffect, useState } from 'react';
import { Trash2, Plus, Clock } from 'lucide-react';
import { sessionService } from '../services/session.service';
import { formatRelativeSlot } from '../lib/datetime';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { Badge } from './ui/Badge';
import { Skeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/Tooltip';

export default function AvailabilityManager() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
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
    if (!date || !startTime || !endTime) return;

    const startISO = new Date(`${date}T${startTime}`).toISOString();
    const endISO = new Date(`${date}T${endTime}`).toISOString();

    if (endISO <= startISO) {
      setError('End time must be after start time');
      return;
    }

    try {
      await sessionService.addAvailability(startISO, endISO);
      setDate('');
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
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
    <div>
      <h1 className="text-h3 font-display font-semibold text-text mb-6">My Availability</h1>

      {error && (
        <div className="bg-danger/10 border border-danger text-danger rounded-lg p-3 mb-4 text-body-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAddSlot} className="bg-surface-raised border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-body-sm font-medium text-text mb-3">
          <Clock size={16} className="text-brand" />
          Add a time slot
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="slot-date" className="block text-caption text-text-muted mb-1">Date</label>
            <input
              id="slot-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="bg-surface rounded-md border border-border px-3 py-2 text-body-sm text-text focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="slot-start" className="block text-caption text-text-muted mb-1">Start</label>
            <input
              id="slot-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="bg-surface rounded-md border border-border px-3 py-2 text-body-sm text-text focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="slot-end" className="block text-caption text-text-muted mb-1">End</label>
            <input
              id="slot-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="bg-surface rounded-md border border-border px-3 py-2 text-body-sm text-text focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            <Plus size={16} /> Add slot
          </Button>
        </div>
      </form>

      {slots.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No availability slots yet"
          body="Add one above so mentees can book a session with you."
        />
      ) : (
        <div className="space-y-2">
          {slots.map((slot) => (
            <div key={slot._id} className="flex items-center justify-between bg-surface-raised border border-border rounded-lg px-4 py-3">
              <span className="text-body-sm text-text">{formatRelativeSlot(slot)}</span>
              <div className="flex items-center gap-3">
                <Badge variant={slot.status === 'open' ? 'success' : 'brand'} size="sm">
                  {slot.status === 'open' ? 'Open' : 'Booked'}
                </Badge>
                {slot.status === 'open' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <IconButton aria-label="Remove slot" onClick={() => handleRemoveSlot(slot._id)} className="h-8 w-8 hover:text-danger">
                        <Trash2 size={16} />
                      </IconButton>
                    </TooltipTrigger>
                    <TooltipContent>Remove slot</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
