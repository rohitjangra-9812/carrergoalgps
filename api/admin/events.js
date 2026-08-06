import os from "os";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_admin_key_2026';

export default function handler(req, res) {
  // We can't verify token via headers easily for SSE from EventSource in browser natively without query params
  // Mocking basic event streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendMetrics = () => {
    const cpus = os.cpus();
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total);
    }, 0) / cpus.length;

    const memoryUsage = process.memoryUsage();
    const memPercent = memoryUsage.heapUsed / memoryUsage.heapTotal;

    const data = {
      type: "metrics",
      metrics: {
        activeSessions: Math.floor(Math.random() * 50) + 10,
        chatQueries: Math.floor(Math.random() * 500) + 100,
        cpuUsage: Math.round(cpuUsage * 100),
        memoryUsage: Math.round(memPercent * 100)
      }
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendMetrics();
  const interval = setInterval(sendMetrics, 5000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
}
