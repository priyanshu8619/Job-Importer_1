const { Server } = require("socket.io");

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        // Replace with your actual frontend URLs
        origin: ["https://job-importer-1.vercel.app", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};