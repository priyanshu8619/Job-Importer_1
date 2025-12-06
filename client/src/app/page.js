'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client'; // Import Client Socket
import { formatDistanceToNow } from 'date-fns';
import api from '@/utils/api';
import clsx from 'clsx';

// Initialize Socket outside component
const socket = io('http://localhost:5000');

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/import/history');
      setLogs(data);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const handleTrigger = async () => {
    setLoading(true);
    try {
      await api.post('/import/trigger');
      // No need to fetch here, socket 'job-start' will trigger it
    } catch (error) {
      alert('Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    // --- REAL-TIME LISTENERS ---
    
    // 1. When a job starts processing
    socket.on('job-start', (data) => {
      console.log('Job Started:', data.url);
      fetchHistory(); // Refresh to show "PROCESSING" status
    });

    // 2. When a job finishes
    socket.on('job-complete', (data) => {
      console.log('Job Complete:', data.feedUrl);
      fetchHistory(); // Refresh to show "COMPLETED" status
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off('job-start');
      socket.off('job-complete');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Job Import Manager</h1>
            <p className="text-gray-500 mt-1">
              Real-time Feed Processor & History Tracker
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
             <span className="text-sm text-gray-400">
                Live Updates Active 🟢
             </span>
            <button
              onClick={handleTrigger}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium text-white shadow-lg transition-all 
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
            >
              {loading ? 'Queueing...' : '🚀 Run New Import'}
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Source Feed</th>
                  <th className="px-6 py-4 text-center">Total</th>
                  <th className="px-6 py-4 text-center text-green-600">New</th>
                  <th className="px-6 py-4 text-center text-blue-600">Updated</th>
                  <th className="px-6 py-4 text-center text-red-600">Failed</th>
                  <th className="px-6 py-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-400">
                      No import history found. Click "Run New Import".
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[300px] truncate text-sm text-gray-700" title={log.feedUrl}>
                          {log.feedUrl}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-700">{log.totalFetched}</td>
                      <td className="px-6 py-4 text-center font-bold text-green-600 bg-green-50 rounded-lg">+{log.newJobs}</td>
                      <td className="px-6 py-4 text-center text-blue-600">{log.updatedJobs}</td>
                      <td className="px-6 py-4 text-center text-red-600">{log.failedJobs}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-gray-100 text-gray-600',
    PROCESSING: 'bg-yellow-50 text-yellow-700 animate-pulse border-yellow-200',
    COMPLETED: 'bg-green-50 text-green-700 border-green-200',
    FAILED: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={clsx('px-3 py-1 rounded-full text-xs font-bold border', styles[status] || styles.PENDING)}>
      {status}
    </span>
  );
}