'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import api from '@/utils/api';
import clsx from 'clsx';

// Initialize Socket
const socket = io(process.env.NEXT_PUBLIC_API_URL || 'https://job-importer-1-mf4u.onrender.com', {
  transports: ['websocket'],
  withCredentials: true,
});

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // --- PAGINATION STATE ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async (pageNumber = 1) => {
    try {
      // Updated to send page query param
      const { data } = await api.get(`/import/history?page=${pageNumber}&limit=5`);
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages);
      setPage(data.pagination.currentPage);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const handleTrigger = async () => {
    setLoading(true);
    try {
      await api.post('/import/trigger', { url: 'https://jobicy.com/?feed=job_feed' });
      // We don't fetchHistory here immediately; we wait for the socket 'job-start'
    } catch (error) {
      alert('Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);

    // --- REAL-TIME LISTENERS ---
    socket.on('job-start', () => {
      // If a new job starts, go back to page 1 to see it
      if (page !== 1) setPage(1);
      else fetchHistory(1);
    });

    socket.on('job-complete', () => fetchHistory(1));

    return () => {
      socket.off('job-start');
      socket.off('job-complete');
    };
  }, [page]); // Re-run when page changes

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Job Import Manager</h1>
            <p className="text-gray-500 mt-1">Real-time Feed Processor (Queue: Redis)</p>
          </div>
          <button
            onClick={handleTrigger}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium text-white shadow-lg transition-all 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
          >
            {loading ? 'Queueing...' : '🚀 Run New Import'}
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Source Feed</th>
                  <th className="px-6 py-4 text-center">New</th>
                  <th className="px-6 py-4 text-center">Updated</th>
                  <th className="px-6 py-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">No logs found.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4"><StatusBadge status={log.status} /></td>
                      <td className="px-6 py-4 text-sm text-gray-700">{log.feedUrl}</td>
                      <td className="px-6 py-4 text-center font-bold text-green-600">+{log.newJobs}</td>
                      <td className="px-6 py-4 text-center text-blue-600">{log.updatedJobs}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PROCESSING: 'bg-yellow-50 text-yellow-700 animate-pulse border-yellow-200',
    COMPLETED: 'bg-green-50 text-green-700 border-green-200',
    FAILED: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={clsx('px-3 py-1 rounded-full text-xs font-bold border', styles[status])}>
      {status}
    </span>
  );
} 