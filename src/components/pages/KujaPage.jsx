import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import KujaCounter from '../kuja/KujaCounter';
import ResetForm from '../kuja/ResetForm';
import LogList from '../kuja/LogList';
import { getLogs, addLog, calculateDaysSince } from '../../services/kujaService';
import { RefreshCw } from 'lucide-react';

const KujaPage = () => {
  const [logs, setLogs] = useState([]);
  const [days, setDays] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const fetchedLogs = await getLogs();
    setLogs(fetchedLogs);

    if (fetchedLogs.length > 0) {
      const lastLostDate = fetchedLogs[0].timestamp;
      setDays(calculateDaysSince(lastLostDate));
    } else {
      setDays(0); // Default if no logs
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReset = async (name, reason) => {
    await addLog(name, reason);
    await fetchData(); // Refresh data to show new log and reset counter
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <KujaCounter days={loading ? '...' : days} />

        <button
          onClick={() => setIsFormOpen(true)}
          className="mt-8 group flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 rounded-full font-bold transition-all hover:scale-105"
        >
          <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" />
          She Lost Something Again...
        </button>

        <LogList logs={logs} />
      </motion.div>

      <ResetForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleReset}
      />
    </div>
  );
};

export default KujaPage;
