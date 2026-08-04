import mongoose from 'mongoose';

export const checkHealth = async (req, res) => {
  const dbStates = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const dbState = dbStates[mongoose.connection.readyState] || 'Unknown';

  res.status(200).json({
    success: true,
    service: 'Type Rush API',
    status: 'online',
    version: '1.0.0',
    database: {
      status: dbState,
      isConnected: mongoose.connection.readyState === 1,
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};
