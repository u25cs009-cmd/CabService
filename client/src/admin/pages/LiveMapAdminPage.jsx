import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import LiveMap from '../../components/LiveMap';
import { connectSocket, disconnectSocket } from '../../services/socketService';
import { Radio, Car, ShieldCheck, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';

export default function LiveMapAdminPage() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filter, setFilter] = useState('all'); // all, available, on_trip
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  const fetchOnlineDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/drivers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDrivers(data.data.filter((d) => d.isOnline));
      }
    } catch (err) {
      console.error('Error fetching drivers for live map:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineDrivers();

    // Socket.IO Connection for Admin Room
    const adminToken = localStorage.getItem('admin_token');
    const socket = connectSocket({ token: adminToken });

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    // Real-time location stream from drivers
    socket.on('admin:driver_location', (data) => {
      setDrivers((prevDrivers) => {
        const index = prevDrivers.findIndex((d) => d._id === data.driverId);
        if (index !== -1) {
          const updated = [...prevDrivers];
          updated[index] = {
            ...updated[index],
            location: { type: 'Point', coordinates: [data.location.lng, data.location.lat] },
            heading: data.heading,
            speed: data.speed,
            status: data.status
          };
          return updated;
        } else {
          return [
            ...prevDrivers,
            {
              _id: data.driverId,
              name: data.name,
              vehicleNumber: data.vehicleNumber,
              vehicleType: data.vehicleType,
              status: data.status,
              isOnline: true,
              location: { type: 'Point', coordinates: [data.location.lng, data.location.lat] },
              heading: data.heading,
              speed: data.speed
            }
          ];
        }
      });
    });

    const interval = setInterval(fetchOnlineDrivers, 15000);

    return () => {
      clearInterval(interval);
      disconnectSocket();
    };
  }, []);

  const filteredDrivers = drivers.filter((d) => {
    if (filter === 'available') return d.status === 'available';
    if (filter === 'on_trip') return d.status === 'on_trip';
    return true;
  });

  const activeDriverPos = selectedDriver?.location?.coordinates
    ? { lat: selectedDriver.location.coordinates[1], lng: selectedDriver.location.coordinates[0] }
    : drivers[0]?.location?.coordinates
    ? { lat: drivers[0].location.coordinates[1], lng: drivers[0].location.coordinates[0] }
    : { lat: 28.6139, lng: 77.2090 };

  return (
    <AdminLayout title="Live Fleet Operations Map">
      <div className="space-y-6">
        {/* Header Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${socketConnected ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                {socketConnected ? '🟢 REALTIME SOCKET CONNECTED' : '🟡 REST FALLBACK'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Monitor active online drivers, live GPS location feeds, and active rides across the city
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchOnlineDrivers}>
              Refresh Fleet
            </Button>
          </div>
        </div>

        {/* Map & Driver List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Map Panel */}
          <div className="lg:col-span-2 space-y-2">
            <LiveMap
              driverLocation={activeDriverPos}
              height="550px"
              zoom={13}
            />
          </div>

          {/* Roster & Filter Sidebar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Online Drivers ({filteredDrivers.length})</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${filter === 'all' ? 'bg-amber-500 text-slate-900' : 'bg-slate-100 text-slate-600'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${filter === 'available' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Available
                </button>
                <button
                  onClick={() => setFilter('on_trip')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${filter === 'on_trip' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  On Trip
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 font-medium">Loading live driver positions...</div>
            ) : filteredDrivers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-medium">No online drivers matching filter.</div>
            ) : (
              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {filteredDrivers.map((d) => {
                  const isSelected = selectedDriver?._id === d._id;
                  const lng = d.location?.coordinates?.[0] || 0;
                  const lat = d.location?.coordinates?.[1] || 0;

                  return (
                    <div
                      key={d._id}
                      onClick={() => setSelectedDriver(d)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${isSelected ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900 text-sm">{d.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${d.status === 'available' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                          {d.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-slate-500 font-medium flex justify-between">
                        <span>{d.vehicleType} • <strong className="text-slate-700">{d.vehicleNumber}</strong></span>
                        <span className="font-mono text-[10px]">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
