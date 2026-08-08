import rateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import os from "os";
import EventEmitter from "events";
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from "node-cron";

dotenv.config();

const __dirname = process.cwd();


const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_admin_key_2026';
const adminEvents = new EventEmitter();

// Mock Global State
const globalState = {
  activeSessions: 0,
  chatQueries: 0,
  errors: [],
  broadcasts: [],
  features: {
    chatEnabled: true,
    aiEnabled: true
  },
  users: [
    { id: 1, name: 'Alice', email: 'alice@example.com', status: 'Active' },
    { id: 2, name: 'Bob', email: 'bob@example.com', status: 'Active' }
  ],
  
  exams: [
    { name: "JEE Main 2026", type: "Engineering", applicationStart: "Nov 1, 2025", lastDate: "Dec 15, 2025", examWindow: "Jan 20-30, 2026" },
    { name: "JEE Advanced 2026", type: "Engineering", applicationStart: "Apr 25, 2026", lastDate: "May 5, 2026", examWindow: "May 25, 2026" },
    { name: "NEET UG 2026", type: "Medical", applicationStart: "Feb 10, 2026", lastDate: "Mar 15, 2026", examWindow: "May 3, 2026" },
    { name: "NEET PG 2026", type: "Medical PG", applicationStart: "Apr 15, 2026", lastDate: "May 6, 2026", examWindow: "Jun 20, 2026" },
    { name: "UPSC CSE 2026", type: "Civil Services", applicationStart: "Feb 15, 2026", lastDate: "Mar 5, 2026", examWindow: "May 24, 2026 (Prelims)" },
    { name: "UPSC NDA 2026", type: "Defence", applicationStart: "Dec 20, 2025", lastDate: "Jan 9, 2026", examWindow: "Apr 19, 2026" },
    { name: "UPSC CDS 2026", type: "Defence", applicationStart: "Dec 20, 2025", lastDate: "Jan 9, 2026", examWindow: "Apr 19, 2026" },
    { name: "GATE 2026", type: "Engineering PG", applicationStart: "Aug 30, 2025", lastDate: "Oct 12, 2025", examWindow: "Feb 7-15, 2026" },
    { name: "IBPS PO 2026", type: "Banking", applicationStart: "Aug 1, 2026", lastDate: "Aug 21, 2026", examWindow: "Oct 2026 (Prelims)" },
    { name: "SBI PO 2026", type: "Banking", applicationStart: "Sep 5, 2026", lastDate: "Sep 25, 2026", examWindow: "Nov 2026 (Prelims)" },
    { name: "SSC CGL 2026", type: "Government", applicationStart: "Jun 10, 2026", lastDate: "Jul 10, 2026", examWindow: "Sep 2026" },
    { name: "CLAT 2026", type: "Law", applicationStart: "Jul 15, 2025", lastDate: "Nov 3, 2025", examWindow: "Dec 7, 2025" },
    { name: "CAT 2026", type: "Management", applicationStart: "Aug 1, 2026", lastDate: "Sep 15, 2026", examWindow: "Nov 29, 2026" },
    { name: "CUET UG 2026", type: "Undergraduate", applicationStart: "Feb 27, 2026", lastDate: "Mar 26, 2026", examWindow: "May 15-31, 2026" },
    { name: "RRB NTPC 2026", type: "Railways", applicationStart: "Mar 1, 2026", lastDate: "Mar 31, 2026", examWindow: "Jul-Sep 2026" }
  ],
  content: [
    { id: 1, mod: 'Current Affairs', title: 'Union Budget 2026 Analysis', status: 'Published' },
    { id: 2, mod: 'Study Material', title: 'UPSC Prelims 2025 PYQ', status: 'Published' }
  ]
};

// Periodic mock data update for active sessions and system health
setInterval(() => {
  globalState.activeSessions = Math.floor(Math.random() * 50) + 10;
  
  const cpus = os.cpus();
  const cpuUsage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    return acc + ((total - idle) / total);
  }, 0) / cpus.length;

  const memoryUsage = process.memoryUsage();
  const memPercent = memoryUsage.heapUsed / memoryUsage.heapTotal;

  adminEvents.emit('metrics', {
    activeSessions: globalState.activeSessions,
    chatQueries: globalState.chatQueries,
    cpuUsage: Math.round(cpuUsage * 100),
    memoryUsage: Math.round(memPercent * 100)
  });
}, 5000);

// Admin Auth Middleware
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: "Forbidden: Not an admin" });
    }
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const app = express();
async function startServer() {
  app.set('trust proxy', 1);

  // Security Hardening
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for local dev/Vite HMR
  }));

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: { error: "Too many requests from this IP, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, trustProxy: false },
  });

  const authLimiter = rateLimit({
    validate: { xForwardedForHeader: false, trustProxy: false },
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 failed login attempts per `window`
    message: { error: "Too many login attempts from this IP, please try again after an hour" },
  });

  app.use("/api/", apiLimiter);

  // Admin Login Endpoint with Security Logging
  app.post("/api/admin/login", express.json(), authLimiter, (req, res) => {
    try {
      const username = req.body?.username;
      const password = req.body?.password;
      
      // Input Sanitization Mock (Basic Check)
      if (typeof username !== "string" || typeof password !== "string" || username.includes("$") || password.includes("$")) {
        console.warn(`[SECURITY ALERT] Suspicious input detected from IP: ${req.ip}`);
        return res.status(400).json({ error: "Invalid input format" });
      }

      // Hardcoded credentials for mock Admin Portal
      if ((username === "admin" || username === "admin_core") && password === "core_gps_2026_portal") {
        console.log(`[AUTH] Admin login successful from IP: ${req.ip}`);
        const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "12h" });
        return res.json({ token, message: "Login successful" });
      } else {
        console.warn(`[AUTH FAILED] Failed admin login attempt for user ${username} from IP: ${req.ip}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error(`[AUTH ERROR] ${error.message}`);
      return res.status(500).json({ error: "Internal server error during authentication" });
    }
  });

  
  // Admin Dashboard API Endpoints (Secured)
  app.get("/api/admin/events", (req, res) => {
    // Basic SSE setup (we might want to authenticate this via query param or skip for simplicity in mock)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    
    // Send initial state
    res.write(`data: ${JSON.stringify({ type: 'init', features: globalState.features, users: globalState.users, content: globalState.content, broadcasts: globalState.broadcasts })}\n\n`);
    const pingInterval = setInterval(() => {
      res.write(': ping\n\n');
    }, 15000);

    const metricsListener = (metrics) => {
      res.write(`data: ${JSON.stringify({ type: 'metrics', metrics })}\n\n`);
    };
    
    const broadcastListener = (broadcast) => {
      res.write(`data: ${JSON.stringify({ type: 'broadcast', broadcast })}\n\n`);
    };

    const contentListener = (contentData) => {
      res.write(`data: ${JSON.stringify({ type: 'content', content: contentData })}\n\n`);
    };
    const featuresListener = (features) => {
      res.write(`data: ${JSON.stringify({ type: 'features', features })}\n\n`);
    };

    adminEvents.on('metrics', metricsListener);
    adminEvents.on('broadcast', broadcastListener);
    adminEvents.on('content', contentListener);
    adminEvents.on('features', featuresListener);

    req.on('close', () => {
      clearInterval(pingInterval);
      adminEvents.off('metrics', metricsListener);
      adminEvents.off('broadcast', broadcastListener);
      adminEvents.off('content', contentListener);
      adminEvents.off('features', featuresListener);
    });
  });

  app.post("/api/admin/broadcast", express.json(), verifyAdmin, (req, res) => {
    const { messageType, messageContent } = req.body;
    const broadcast = { id: Date.now(), type: messageType, content: messageContent, timestamp: new Date().toISOString() };
    globalState.broadcasts.unshift(broadcast);
    adminEvents.emit('broadcast', broadcast);
    res.json({ success: true, broadcast });
  });

    app.post("/api/admin/content", express.json(), verifyAdmin, (req, res) => {
    const { mod, title, status } = req.body;
    const newContent = { id: Date.now(), mod, title, status };
    globalState.content.unshift(newContent);
    adminEvents.emit('content', globalState.content);
    
    if (status === 'Published') {
      const broadcast = { id: Date.now() + 1, type: 'New ' + mod, content: `${title} is now available!`, timestamp: new Date().toISOString() };
      globalState.broadcasts.unshift(broadcast);
      adminEvents.emit('broadcast', broadcast);
    }
    
    res.json({ success: true, content: globalState.content });
  });

  app.post("/api/admin/features", express.json(), verifyAdmin, (req, res) => {
    const { features } = req.body;
    globalState.features = { ...globalState.features, ...features };
    adminEvents.emit('features', globalState.features);
    res.json({ success: true, features: globalState.features });
  });

  
  app.get("/api/exams", (req, res) => {
    res.json(globalState.exams || []);
  });

  app.get("/api/admin/users", verifyAdmin, (req, res) => res.json(globalState.users));
  
  app.post("/api/admin/users/:id/toggle", verifyAdmin, (req, res) => {
    const user = globalState.users.find(u => u.id == req.params.id);
    if(user) {
      user.status = user.status === 'Active' ? 'Suspended' : 'Active';
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.delete("/api/admin/content/:id", verifyAdmin, (req, res) => {
    globalState.content = globalState.content.filter(c => c.id != req.params.id);
    res.json({ success: true });
  });

  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API route for chat
  app.post('/api/chat', async (req, res) => {
    if (!globalState.features.chatEnabled || !globalState.features.aiEnabled) {
      return res.status(503).json({ error: "Chat service is currently disabled for maintenance." });
    }
    globalState.chatQueries++;
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(401).json({ error: "API Key is not configured. Please add your GEMINI_API_KEY to the environment variables to enable AI responses." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const { history, message, files, language } = req.body;
      const contents = [];
      if (history) {
        for (const msg of history) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }
      }
      
      const currentParts = [];
      if (files && files.length > 0) {
        for (const f of files) {
          currentParts.push({
            inlineData: {
              data: f.data,
              mimeType: f.mimeType
            }
          });
        }
      }
      currentParts.push({ text: message });
      
      contents.push({
        role: 'user',
        parts: currentParts
      });

      const trackerData = {
        exams: [
          { name: "JEE Main 2026", type: "Engineering", applicationStart: "Nov 1, 2025", lastDate: "Dec 15, 2025", examWindow: "Jan 20-30, 2026" },
          { name: "JEE Advanced 2026", type: "Engineering", applicationStart: "Apr 25, 2026", lastDate: "May 5, 2026", examWindow: "May 25, 2026" },
          { name: "BITSAT 2026", type: "Engineering", applicationStart: "Jan 15, 2026", lastDate: "Apr 10, 2026", examWindow: "May 20-25, 2026" },
          { name: "VITEEE 2026", type: "Engineering", applicationStart: "Nov 1, 2025", lastDate: "Mar 30, 2026", examWindow: "Apr 15-25, 2026" },
          { name: "SRMJEEE 2026", type: "Engineering", applicationStart: "Nov 10, 2025", lastDate: "Apr 10, 2026", examWindow: "Apr 20-25, 2026" },
          { name: "COMEDK UGET 2026", type: "Engineering", applicationStart: "Feb 1, 2026", lastDate: "Apr 5, 2026", examWindow: "May 10, 2026" },
          { name: "WBJEE 2026", type: "Engineering", applicationStart: "Dec 20, 2025", lastDate: "Jan 31, 2026", examWindow: "Apr 26, 2026" },
          { name: "MHT CET 2026", type: "Engineering/Pharmacy", applicationStart: "Jan 15, 2026", lastDate: "Mar 1, 2026", examWindow: "Apr 15-30, 2026" },
          { name: "NEET UG 2026", type: "Medical", applicationStart: "Feb 10, 2026", lastDate: "Mar 15, 2026", examWindow: "May 3, 2026" },
          { name: "NEET PG 2026", type: "Medical PG", applicationStart: "Apr 15, 2026", lastDate: "May 6, 2026", examWindow: "Jun 20, 2026" },
          { name: "INI CET 2026", type: "Medical PG", applicationStart: "Sep 15, 2025", lastDate: "Oct 15, 2025", examWindow: "Nov 10, 2025" },
          { name: "UPSC CSE 2026", type: "Civil Services", applicationStart: "Feb 15, 2026", lastDate: "Mar 5, 2026", examWindow: "May 24, 2026 (Prelims)" },
          { name: "UPSC NDA & NA I 2026", type: "Defence", applicationStart: "Dec 20, 2025", lastDate: "Jan 9, 2026", examWindow: "Apr 19, 2026" },
          { name: "UPSC NDA & NA II 2026", type: "Defence", applicationStart: "May 15, 2026", lastDate: "Jun 5, 2026", examWindow: "Sep 6, 2026" },
          { name: "UPSC CDS I 2026", type: "Defence", applicationStart: "Dec 20, 2025", lastDate: "Jan 9, 2026", examWindow: "Apr 19, 2026" },
          { name: "UPSC CDS II 2026", type: "Defence", applicationStart: "May 15, 2026", lastDate: "Jun 5, 2026", examWindow: "Sep 6, 2026" },
          { name: "UPSC CAPF (AC) 2026", type: "Defence", applicationStart: "Apr 15, 2026", lastDate: "May 5, 2026", examWindow: "Aug 2, 2026" },
          { name: "AFCAT I 2026", type: "Defence", applicationStart: "Dec 1, 2025", lastDate: "Dec 30, 2025", examWindow: "Feb 14-16, 2026" },
          { name: "AFCAT II 2026", type: "Defence", applicationStart: "Jun 1, 2026", lastDate: "Jun 30, 2026", examWindow: "Aug 28-30, 2026" },
          { name: "GATE 2026", type: "Engineering PG", applicationStart: "Aug 30, 2025", lastDate: "Oct 12, 2025", examWindow: "Feb 7-15, 2026" },
          { name: "IBPS PO 2026", type: "Banking", applicationStart: "Aug 1, 2026", lastDate: "Aug 21, 2026", examWindow: "Oct 2026 (Prelims)" },
          { name: "IBPS Clerk 2026", type: "Banking", applicationStart: "Jul 1, 2026", lastDate: "Jul 21, 2026", examWindow: "Aug 2026 (Prelims)" },
          { name: "IBPS RRB 2026", type: "Banking", applicationStart: "Jun 1, 2026", lastDate: "Jun 21, 2026", examWindow: "Aug 2026 (Prelims)" },
          { name: "SBI PO 2026", type: "Banking", applicationStart: "Sep 5, 2026", lastDate: "Sep 25, 2026", examWindow: "Nov 2026 (Prelims)" },
          { name: "SBI Clerk 2026", type: "Banking", applicationStart: "Nov 15, 2025", lastDate: "Dec 10, 2025", examWindow: "Jan 2026 (Prelims)" },
          { name: "RBI Grade B 2026", type: "Banking/Regulatory", applicationStart: "Jul 15, 2026", lastDate: "Aug 5, 2026", examWindow: "Sep 2026 (Phase 1)" },
          { name: "SSC CGL 2026", type: "Government", applicationStart: "Jun 10, 2026", lastDate: "Jul 10, 2026", examWindow: "Sep 2026" },
          { name: "SSC CHSL 2026", type: "Government", applicationStart: "Apr 1, 2026", lastDate: "May 1, 2026", examWindow: "Jul 2026" },
          { name: "SSC MTS 2026", type: "Government", applicationStart: "May 15, 2026", lastDate: "Jun 15, 2026", examWindow: "Aug 2026" },
          { name: "SSC CPO 2026", type: "Government", applicationStart: "Mar 1, 2026", lastDate: "Mar 28, 2026", examWindow: "May 2026" },
          { name: "SSC GD Constable 2026", type: "Government", applicationStart: "Aug 25, 2026", lastDate: "Sep 25, 2026", examWindow: "Jan-Feb 2027" },
          { name: "CLAT 2026", type: "Law", applicationStart: "Jul 15, 2025", lastDate: "Nov 3, 2025", examWindow: "Dec 7, 2025" },
          { name: "AILET 2026", type: "Law", applicationStart: "Aug 1, 2025", lastDate: "Nov 15, 2025", examWindow: "Dec 14, 2025" },
          { name: "LSAT India 2026", type: "Law", applicationStart: "Aug 15, 2025", lastDate: "Jan 10, 2026", examWindow: "Jan 20-21, 2026" },
          { name: "CAT 2026", type: "Management", applicationStart: "Aug 1, 2026", lastDate: "Sep 15, 2026", examWindow: "Nov 29, 2026" },
          { name: "XAT 2026", type: "Management", applicationStart: "Jul 15, 2025", lastDate: "Nov 30, 2025", examWindow: "Jan 4, 2026" },
          { name: "MAT 2026 (Feb)", type: "Management", applicationStart: "Dec 15, 2025", lastDate: "Feb 15, 2026", examWindow: "Feb 22, 2026 (PBT)" },
          { name: "CMAT 2026", type: "Management", applicationStart: "Feb 15, 2026", lastDate: "Mar 15, 2026", examWindow: "May 2026" },
          { name: "SNAP 2026", type: "Management", applicationStart: "Aug 15, 2025", lastDate: "Nov 20, 2025", examWindow: "Dec 10, 17, 22, 2025" },
          { name: "CUET UG 2026", type: "Undergraduate (All Subjects)", applicationStart: "Feb 27, 2026", lastDate: "Mar 26, 2026", examWindow: "May 15-31, 2026" },
          { name: "CUET PG 2026", type: "Postgraduate (All Subjects)", applicationStart: "Dec 20, 2025", lastDate: "Jan 25, 2026", examWindow: "Mar 11-28, 2026" },
          { name: "UGC NET 2026 (June)", type: "Lectureship/JRF", applicationStart: "Apr 20, 2026", lastDate: "May 10, 2026", examWindow: "Jun 10-21, 2026" },
          { name: "CSIR NET 2026 (June)", type: "Science Research/JRF", applicationStart: "May 1, 2026", lastDate: "May 25, 2026", examWindow: "Jun 25-27, 2026" },
          { name: "IIT JAM 2026", type: "Science PG", applicationStart: "Sep 5, 2025", lastDate: "Oct 15, 2025", examWindow: "Feb 8, 2026" },
          { name: "CTET 2026 (Jan)", type: "Teaching", applicationStart: "Nov 1, 2025", lastDate: "Nov 25, 2025", examWindow: "Jan 21, 2026" },
          { name: "RRB NTPC 2026", type: "Railways", applicationStart: "Mar 1, 2026", lastDate: "Mar 31, 2026", examWindow: "Jul-Sep 2026" },
          { name: "RRB Group D 2026", type: "Railways", applicationStart: "Apr 15, 2026", lastDate: "May 15, 2026", examWindow: "Sep-Nov 2026" },
          { name: "RRB ALP 2026", type: "Railways", applicationStart: "Jan 20, 2026", lastDate: "Feb 20, 2026", examWindow: "Jun 2026" },
          { name: "NID DAT 2026 (Prelims)", type: "Design", applicationStart: "Sep 8, 2025", lastDate: "Dec 1, 2025", examWindow: "Dec 24, 2025" },
          { name: "UCEED 2026", type: "Design UG", applicationStart: "Oct 1, 2025", lastDate: "Nov 10, 2025", examWindow: "Jan 18, 2026" },
          { name: "CEED 2026", type: "Design PG", applicationStart: "Oct 1, 2025", lastDate: "Nov 10, 2025", examWindow: "Jan 18, 2026" },
          { name: "NIFT 2026", type: "Design", applicationStart: "Nov 1, 2025", lastDate: "Dec 31, 2025", examWindow: "Feb 5, 2026" },
          { name: "NATA 2026", type: "Architecture", applicationStart: "Mar 1, 2026", lastDate: "Mar 30, 2026", examWindow: "Apr-Jul 2026 (Multiple Phases)" },
          { name: "CA Foundation 2026 (June)", type: "Finance/Accounting", applicationStart: "Feb 5, 2026", lastDate: "Feb 25, 2026", examWindow: "Jun 20-26, 2026" },
          { name: "CA Inter 2026 (May)", type: "Finance/Accounting", applicationStart: "Feb 5, 2026", lastDate: "Feb 25, 2026", examWindow: "May 3-15, 2026" },
          { name: "CA Final 2026 (May)", type: "Finance/Accounting", applicationStart: "Feb 5, 2026", lastDate: "Feb 25, 2026", examWindow: "May 2-14, 2026" },
          { name: "CS Executive 2026 (June)", type: "Company Secretary", applicationStart: "Feb 26, 2026", lastDate: "Mar 25, 2026", examWindow: "Jun 1-10, 2026" },
          { name: "CMA Foundation 2026 (June)", type: "Cost Management", applicationStart: "Jan 10, 2026", lastDate: "Apr 10, 2026", examWindow: "Jun 15, 2026" },
          { name: "UPPSC PCS 2026", type: "State PSC", applicationStart: "Jan 1, 2026", lastDate: "Jan 29, 2026", examWindow: "Mar 2026" },
          { name: "BPSC CCE 2026", type: "State PSC", applicationStart: "Jul 15, 2026", lastDate: "Aug 10, 2026", examWindow: "Sep 2026" },
          { name: "MPSC Rajyaseva 2026", type: "State PSC", applicationStart: "Jan 5, 2026", lastDate: "Jan 25, 2026", examWindow: "Apr 2026" },
          { name: "RPSC RAS 2026", type: "State PSC", applicationStart: "Jul 1, 2026", lastDate: "Jul 31, 2026", examWindow: "Oct 2026" }
        ],
        internships: [
          { name: "Google Step", target: "1st/2nd Year College", field: "Tech/Software", status: "Applications Open Sept 2026" },
          { name: "Microsoft Engage", target: "2nd Year College", field: "Tech/Software", status: "Applications Open May 2026" },
          { name: "AICTE Internship Portal", target: "All College Students", field: "Various (Govt/Private)", status: "Rolling Admissions" },
          { name: "NAPS Apprenticeship", target: "Post-10th/12th/ITI", field: "Vocational/Technical", status: "Always Open" },
          { name: "Goldman Sachs Engineering Campus Hire", target: "Pre-Final Year", field: "Tech/Finance", status: "Applications Open July 2026" },
          { name: "NITI Aayog Internship", target: "UG/PG Students", field: "Public Policy/Govt", status: "1st to 10th of every month" }
        ],
        studyMaterials: [
          { exam: "JEE Main", subject: "Physics, Chemistry, Maths", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/jee-main-pyq-10yrs.pdf" },
          { exam: "JEE Advanced", subject: "Physics, Chemistry, Maths", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/jee-adv-pyq-10yrs.pdf" },
          { exam: "NEET UG", subject: "Physics, Chemistry, Biology", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/neet-ug-pyq-10yrs.pdf" },
          { exam: "NEET PG", subject: "Medical PG Subjects", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/neet-pg-pyq-10yrs.pdf" },
          { exam: "UPSC CSE", subject: "GS Paper I & II, Optional Subjects", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/upsc-cse-pyq-10yrs.pdf" },
          { exam: "UPSC NDA", subject: "Maths, GAT", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/upsc-nda-pyq-10yrs.pdf" },
          { exam: "UPSC CDS", subject: "Maths, English, GK", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/upsc-cds-pyq-10yrs.pdf" },
          { exam: "AFCAT", subject: "General Awareness, Verbal Ability, Numerical Ability", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/afcat-pyq-10yrs.pdf" },
          { exam: "GATE", subject: "All Engineering Branches", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/gate-pyq-10yrs.pdf" },
          { exam: "SSC CGL", subject: "Tier I & II", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/ssc-cgl-pyq-10yrs.pdf" },
          { exam: "SSC CHSL", subject: "Tier I & II", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/ssc-chsl-pyq-10yrs.pdf" },
          { exam: "SSC MTS", subject: "Paper I", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/ssc-mts-pyq-10yrs.pdf" },
          { exam: "CAT", subject: "Quant, DILR, VARC", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/cat-pyq-10yrs.pdf" },
          { exam: "MAT", subject: "Quant, DILR, VARC, GK", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/mat-pyq-10yrs.pdf" },
          { exam: "XAT", subject: "Quant, VALR, Decision Making", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/xat-pyq-10yrs.pdf" },
          { exam: "CLAT", subject: "Law, Reasoning, GK", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/clat-pyq-10yrs.pdf" },
          { exam: "IBPS PO", subject: "Prelims & Mains", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/ibps-po-pyq-10yrs.pdf" },
          { exam: "IBPS Clerk", subject: "Prelims & Mains", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/ibps-clerk-pyq-10yrs.pdf" },
          { exam: "SBI PO", subject: "Prelims & Mains", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/sbi-po-pyq-10yrs.pdf" },
          { exam: "SBI Clerk", subject: "Prelims & Mains", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/sbi-clerk-pyq-10yrs.pdf" },
          { exam: "RBI Grade B", subject: "Phase I & II", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/rbi-grade-b-pyq-10yrs.pdf" },
          { exam: "CUET UG", subject: "Domain Subjects, Languages, General Test", type: "PYQ & Mock Tests (Since 2022)", format: "PDF", link: "https://example.com/download/cuet-ug-materials.pdf" },
          { exam: "CUET PG", subject: "Domain Subjects", type: "PYQ & Mock Tests (Since 2022)", format: "PDF", link: "https://example.com/download/cuet-pg-materials.pdf" },
          { exam: "UGC NET", subject: "Paper 1 & Paper 2", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/ugc-net-pyq-10yrs.pdf" },
          { exam: "CSIR NET", subject: "Science Subjects", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/csir-net-pyq-10yrs.pdf" },
          { exam: "CTET", subject: "Paper 1 & 2", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/ctet-pyq-10yrs.pdf" },
          { exam: "RRB NTPC", subject: "CBT 1 & 2", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/rrb-ntpc-pyq-10yrs.pdf" },
          { exam: "RRB Group D", subject: "CBT", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/rrb-group-d-pyq-10yrs.pdf" },
          { exam: "NID DAT", subject: "Prelims & Mains", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/nid-dat-pyq-10yrs.pdf" },
          { exam: "UCEED/CEED", subject: "Part A & B", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/uceed-ceed-pyq-10yrs.pdf" },
          { exam: "CA Foundation/Inter/Final", subject: "All Papers", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/ca-all-pyq-10yrs.pdf" },
          { exam: "State PSC (UPPSC, BPSC, MPSC, etc.)", subject: "Prelims & Mains", type: "Previous 10 Years PYQ (2014-2024)", format: "PDF", link: "https://example.com/download/state-psc-pyq-10yrs.pdf" }
        ],
        salaries: [
          { role: 'Civil Services (IAS)', type: 'Government (7th CPC)', entryLPA: 12, midLPA: 21, seniorLPA: 33, perks: 'Govt Accommodation, Vehicle, Pension, Subsidized utilities', topDesignations: 'Cabinet Secretary, Chief Secretary' },
          { role: 'Civil Services (IPS)', type: 'Government (7th CPC)', entryLPA: 11.5, midLPA: 19, seniorLPA: 31, perks: 'Govt Accommodation, Vehicle, Uniform allowance', topDesignations: 'DGP, Director IB/CBI' },
          { role: 'Banking (SBI PO)', type: 'Banking Sector', entryLPA: 11, midLPA: 21, seniorLPA: 42, perks: 'HRA/Lease, Medical, Travel, Loan benefits', topDesignations: 'General Manager, Chairman' },
          { role: 'Banking (RBI Grade B)', type: 'Central Bank', entryLPA: 21, midLPA: 37, seniorLPA: 60, perks: 'RBI Housing, Local allowance, Grade allowance', topDesignations: 'Executive Director, Deputy Governor' },
          { role: 'Defense (NDA/CDS)', type: 'Defense Forces', entryLPA: 13.5, midLPA: 23, seniorLPA: 35, perks: 'Military Service Pay, Kit maintenance, Field Area allowance', topDesignations: 'Lieutenant General, General' },
          { role: 'Engineering (PSU via GATE)', type: 'Public Sector Undertaking', entryLPA: 16, midLPA: 27, seniorLPA: 50, perks: 'PRP, Cafeteria perquisites, Medical', topDesignations: 'Executive Director, CMD' },
          { role: 'Engineering (ISRO/DRDO)', type: 'Govt Research/Scientific', entryLPA: 12.5, midLPA: 21.5, seniorLPA: 32, perks: 'PRIS, Transport, DA, HRA', topDesignations: 'Outstanding Scientist, Chairman' },
          { role: 'State-Level (State PSC/SDM)', type: 'State Government', entryLPA: 9.5, midLPA: 16, seniorLPA: 23, perks: 'State-specific allowances, Vehicle', topDesignations: 'Promoted to IAS, Special Secretary' },
          { role: 'Teaching (UGC NET)', type: 'Higher Education (7th CPC)', entryLPA: 11.5, midLPA: 20.5, seniorLPA: 28.5, perks: 'Academic Grade Pay, HRA', topDesignations: 'Professor, Vice-Chancellor' },
          { role: 'Software Engineer (Private)', type: 'Private Tech Sector', entryLPA: 15, midLPA: 35, seniorLPA: 75, perks: 'RSUs/ESOPs, Bonus, PF, Health Insurance', topDesignations: 'Principal Engineer, VP, CTO' }
        ]
      };

      const systemInstruction = `You are the "Core Career GPS Engine," an elite, empathetic, and data-driven AI Career Counselor designed to guide students through a 4-Stage Life Roadmap.
IMPORTANT: You MUST respond entirely in ${language || 'English'}.

### 📅 REAL-TIME TRACKING DATA (USE THIS!):
Today's Date: ${new Date().toLocaleDateString()}
If the user asks for "Exam Deadlines" or a roadmap mentions exams, pull from this data (and ensure deadlines are relevant to today's date). I have updated it with more all-India level exams:
${JSON.stringify(trackerData.exams, null, 2)}


If the user asks for "Find Internships" or a roadmap mentions internships, pull from this data matching their grade/year:
${JSON.stringify(trackerData.internships, null, 2)}

If the user asks for Study Materials or PYQs for competitive exams, you MUST use the data from the tracking data below and provide the download links in a clean markdown table. Always provide the last 10 years PYQs as requested.
${JSON.stringify(trackerData.studyMaterials, null, 2)}

If the user asks for salary structures, career progression, or growth trajectories for major competitive exams and career paths across India, you MUST use the data from the salary tracking data below. Present it beautifully using markdown tables or bullet points.
${JSON.stringify(trackerData.salaries, null, 2)}

### 🕹️ OPERATIONAL ROLES & SYSTEM LOGIC:
Adapt your tone, guidance style, and expectations appropriately for each stage:
1. YOUTH/STUDENT: Foundational education, mapping interests to streams, degree pathways, competitive entrance exams, internships, and entry-level job targeting.
2. MID-CAREER PROFESSIONAL: Upskilling, executive education, management transitions, lateral moves, freelance strategies, or career pivots.
3. MATURE/OLDER ADULT: Leveraging past experience, flexible upskilling, second-career opportunities, and consulting.
4. RETIREE / ENCORE CAREER: Passion projects, part-time consulting, mentoring, volunteering, or starting small side businesses. 
Tailor the roadmap engine to generate realistic, future possibilities and step-by-step action plans aligned with their chosen life stage, personal passions, values, and time availability.

### 📝 QUICK ACTIONS HANDLING:
- If user input is exactly "Exam Deadlines", output a clean Markdown table of the tracking data relevant to their profile.
- If user input is exactly "Find Internships", output a clean Markdown table of internships relevant to their profile.
- If user input is exactly "Skill Checklist", generate an interactive Markdown checklist (e.g., \`- [ ]\`) of top skills needed for their target field.
- If user input mentions "Study Materials" or "PYQ", provide structured recommendations for study materials, Previous Year Questions (PYQs), standard books, and notes for their target exams. **You MUST present the data as a clean Markdown table and include the simulated download links as clickable links (e.g., [Download PDF](link)).**
- If user input is exactly "Top Institutions Nearby", ask for their location if not provided, and provide a list of top coaching institutions, colleges, or academies for their target exams/field.

### ⚖️ ELIGIBILITY CHECKER:
If the user provides an "Eligibility Profile" (Stream, Age, Marks), strictly constrain the roadmap and recommended exams/internships based on legal and academic eligibility (e.g., UPSC age limits, JEE percentage criteria).

### 🏛️ FORMATTING & RESPONSES (FOR FULL ROADMAPS):
Always organize your career advice using a clean, hyper-scannable structure. You must use the exact visual headers below when generating a full roadmap:

📍 STEP-BY-STEP ROADMAP
✅ SKILL CHECKLIST & MILESTONES (Interactive Checklists)
🏫 ADMISSION & STUDY HUB (Include Active Exam Deadlines from tracking data)
💼 JOB & INTERNSHIP MARKET RECON (Include Internship recommendations from tracking data)

IMPORTANT: When applicable and necessary to explain complex flows, processes, or decision trees, use standard Markdown bullet lists, numbered steps, or clean Markdown tables. YOU ARE STRICTLY PROHIBITED from generating Mermaid diagrams (i.e., using \`\`\`mermaid ... \`\`\` blocks). Never output the word "mermaid" in code blocks.

Be structured, encouraging, and highly specific.`;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let headersSent = true;
      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('Gemini API Error:', error.stack);
      if (!res.headersSent) {
        res.status(500).json({ error: error.stack });
      } else {
        res.write(`data: ${JSON.stringify({ text: "\n\n⚠️ **Error**: The AI generation was interrupted due to a server error." })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    }
  });

  // API route for doubt solver
  app.post('/api/generate-material', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(401).json({ error: "API Key is not configured." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const { type, topic, target, language } = req.body;

      const systemInstruction = `You are an expert academic tutor and exam preparation specialist. 
IMPORTANT: You MUST generate the content entirely in ${language || 'English'}. 
Your task is to generate complete, well-structured, and comprehensive content for ${type} related to ${topic} for the ${target} exam.
IMPORTANT RULES:
- Generate complete, detailed content.
- Explicitly forbidden: truncation, placeholders, ellipses, or repeating lines.
- Do NOT cut off mid-sentence.
- Ensure the output is fully structured using Markdown headings, bullet points, and clean formatting.
- For PYQs, provide structured question and answer pairs with full explanations.
- For Notes, provide comprehensive subject matter breakdown.
- IMPORTANT: Use standard LaTeX formatting for ALL mathematical expressions, equations, and variables. Use single dollar signs ($math$) for inline equations and double dollar signs ($$math$$) for block equations. Use proper LaTeX syntax for fractions (\\frac{}{}), integrals (\\int), roots (\\sqrt{}), etc.`;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: `Generate comprehensive ${type} on ${topic} for ${target}.` }] }],
        config: { 
          systemInstruction: systemInstruction,
          maxOutputTokens: 8192
        }
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('Gemini API Error in generate-material:', error.stack);
      res.write(`data: ${JSON.stringify({ error: 'Failed to generate material' })}\n\n`);
      res.end();
    }
  });

  app.post('/api/solve-doubt', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(401).json({ error: "API Key is not configured." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const { question, files, language } = req.body;
      
      const systemInstruction = `You are an elite, highly accurate Doubt Solver and Academic Tutor. 
IMPORTANT: You MUST provide your answer entirely in ${language || 'English'}. 
Your goal is to provide direct, factual, and precise answers to the user's specific questions. 
Whether the question is about geographical facts, math problems, historical events, scientific definitions, or conceptual doubts, you must evaluate the text query and generate a contextually accurate, direct, and factually correct answer.
Do not use generic template steps if a direct factual answer is required (e.g., comparing country sizes, definitions, formulas). Be precise and clear.
IMPORTANT: Use standard LaTeX formatting for ALL mathematical expressions, equations, and variables. Use single dollar signs ($math$) for inline equations and double dollar signs ($$math$$) for block equations. Use proper LaTeX syntax for fractions (\\frac{}{}), integrals (\\int), roots (\\sqrt{}), etc.`;

      const currentParts = [];
      if (files && files.length > 0) {
        for (const f of files) {
          currentParts.push({
            inlineData: {
              data: f.data,
              mimeType: f.mimeType
            }
          });
        }
      }
      currentParts.push({ text: question || "Please analyze this file/image." });

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: currentParts }],
        config: { systemInstruction: systemInstruction }
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('Gemini API Error in solve-doubt:', error.stack);
      res.status(500).json({ error: 'Failed to solve doubt' });
    }
  });

  // API route for daily quiz
  let cachedQuiz = {};
  let cachedQuizDate = null;

  app.get('/api/daily-quiz', async (req, res) => {
    try {
      const today = new Date().toDateString();
      const lang = req.query.lang || 'EN';
      if (cachedQuiz[lang] && cachedQuizDate === today) {
        return res.json({ questions: cachedQuiz[lang] });
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(401).json({ error: "API Key is not configured." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const systemInstruction = `Generate a JSON array of exactly 10 multiple-choice questions for a daily quiz.
IMPORTANT: You MUST generate the content entirely in ${lang}.
The questions must cover a balanced mix of disciplines:
1. Quantitative Aptitude & Mathematics
2. Current Affairs & National Events
3. General Knowledge (History, Geography, Polity, Economics)
4. General Science (Physics, Chemistry, Biology)
5. Language & Comprehension

Each object in the array MUST have this exact schema:
{
  "id": number,
  "category": string,
  "question": string,
  "options": [string, string, string, string],
  "correctAnswer": string,
  "explanation": string
}
Return ONLY the raw JSON array. Make sure the options array has exactly 4 distinct strings, and correctAnswer exactly matches one of the options.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: `Generate daily quiz for ${today}` }] }],
        config: { systemInstruction: systemInstruction, responseMimeType: "application/json" }
      });

      let cleanedText = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
      let quizData = JSON.parse(cleanedText);
      
      // Handle case where Gemini wraps in { questions: [...] }
      if (!Array.isArray(quizData) && quizData.questions) {
        quizData = quizData.questions;
      }
      
      if (!Array.isArray(quizData)) {
        throw new Error("Invalid format received from AI");
      }

      cachedQuiz[lang] = quizData;
      cachedQuizDate = today;

      res.json({ questions: cachedQuiz[lang] });
    } catch (error) {
      console.error('Gemini API Error in daily-quiz:', error);
      // Robust Fallback Array
      const fallbackQuiz = [
        { id: 1, category: "Current Affairs", question: "Who recently won the latest international chess championship?", options: ["Magnus Carlsen", "Ding Liren", "Hikaru Nakamura", "Fabiano Caruana"], correctAnswer: "Ding Liren", explanation: "Ding Liren is the current World Chess Champion." },
        { id: 2, category: "General Science", question: "What is the chemical symbol for Gold?", options: ["Au", "Ag", "Fe", "Cu"], correctAnswer: "Au", explanation: "Au comes from the Latin word aurum, meaning gold." },
        { id: 3, category: "Quantitative Aptitude", question: "If a train 150m long is running at a speed of 90 km/hr, how much time will it take to cross a pole?", options: ["5 seconds", "6 seconds", "8 seconds", "10 seconds"], correctAnswer: "6 seconds", explanation: "Speed = 90 * (5/18) = 25 m/s. Time = Distance / Speed = 150 / 25 = 6 seconds." },
        { id: 4, category: "General Knowledge", question: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correctAnswer: "Nile", explanation: "The Nile is traditionally considered the longest river in the world." },
        { id: 5, category: "Language & Comprehension", question: "Choose the correct synonym for 'Lucid'.", options: ["Obscure", "Clear", "Complicated", "Dull"], correctAnswer: "Clear", explanation: "Lucid means expressed clearly; easy to understand." },
        { id: 6, category: "Quantitative Aptitude", question: "What is 15% of 60?", options: ["9", "12", "15", "18"], correctAnswer: "9", explanation: "15% of 60 = (15/100) * 60 = 9." },
        { id: 7, category: "Current Affairs", question: "Which country hosted the 2024 Summer Olympics?", options: ["USA", "Japan", "France", "UK"], correctAnswer: "France", explanation: "The 2024 Summer Olympics were held in Paris, France." },
        { id: 8, category: "General Science", question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: "Mars", explanation: "Mars is called the Red Planet because of iron oxide on its surface." },
        { id: 9, category: "General Knowledge", question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correctAnswer: "William Shakespeare", explanation: "Romeo and Juliet is a tragedy written by William Shakespeare." },
        { id: 10, category: "Language & Comprehension", question: "What is the antonym of 'Benevolent'?", options: ["Kind", "Cruel", "Generous", "Friendly"], correctAnswer: "Cruel", explanation: "Benevolent means well meaning and kindly; its opposite is cruel." }
      ];
      // Do not cache the fallback so it tries again next time, but return 200 OK so frontend doesn't crash
      res.json({ questions: fallbackQuiz });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {

// Scheduler and automated data-sync pipelines
cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Running daily tasks...');
  const today = new Date().toDateString();

  // 1. Daily Current Affairs & Quiz Refresh
  // Update Quiz
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
      const quizSystemInstruction = `Generate a JSON array of exactly 10 multiple-choice questions for a daily quiz. The questions must cover a balanced mix of disciplines (Quant, Current Affairs, GK, Science, Language). Each object MUST have: { id: number, category: string, question: string, options: [4 strings], correctAnswer: string, explanation: string }`;
      const quizResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: `Generate daily quiz for ${today}` }] }],
        config: { systemInstruction: quizSystemInstruction, responseMimeType: "application/json" }
      });
      let quizData = JSON.parse(quizResponse.text.replace(/```json/g, "").replace(/```/g, "").trim());
      if (!Array.isArray(quizData) && quizData.questions) quizData = quizData.questions;
      if (Array.isArray(quizData)) {
        cachedQuiz['EN'] = quizData;
        cachedQuizDate = today;
        console.log('[CRON] Daily Quiz updated successfully.');
      }
    }
  } catch (err) {
    console.error('[CRON] Failed to update Daily Quiz:', err);
    // Populate with fallback quiz if API fails
    const fallbackQuiz = [
      { id: 1, category: "Current Affairs", question: "Who recently won the latest international chess championship?", options: ["Magnus Carlsen", "Ding Liren", "Hikaru Nakamura", "Fabiano Caruana"], correctAnswer: "Ding Liren", explanation: "Ding Liren is the current World Chess Champion." },
      { id: 2, category: "General Science", question: "What is the chemical symbol for Gold?", options: ["Au", "Ag", "Fe", "Cu"], correctAnswer: "Au", explanation: "Au comes from the Latin word aurum, meaning gold." },
      { id: 3, category: "Quantitative Aptitude", question: "If a train 150m long is running at a speed of 90 km/hr, how much time will it take to cross a pole?", options: ["5 seconds", "6 seconds", "8 seconds", "10 seconds"], correctAnswer: "6 seconds", explanation: "Speed = 90 * (5/18) = 25 m/s. Time = Distance / Speed = 150 / 25 = 6 seconds." },
      { id: 4, category: "General Knowledge", question: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correctAnswer: "Nile", explanation: "The Nile is traditionally considered the longest river in the world." },
      { id: 5, category: "Language & Comprehension", question: "Choose the correct synonym for 'Lucid'.", options: ["Obscure", "Clear", "Complicated", "Dull"], correctAnswer: "Clear", explanation: "Lucid means expressed clearly; easy to understand." },
      { id: 6, category: "Quantitative Aptitude", question: "What is 15% of 60?", options: ["9", "12", "15", "18"], correctAnswer: "9", explanation: "15% of 60 = (15/100) * 60 = 9." },
      { id: 7, category: "Current Affairs", question: "Which country hosted the 2024 Summer Olympics?", options: ["USA", "Japan", "France", "UK"], correctAnswer: "France", explanation: "The 2024 Summer Olympics were held in Paris, France." },
      { id: 8, category: "General Science", question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: "Mars", explanation: "Mars is called the Red Planet because of iron oxide on its surface." },
      { id: 9, category: "General Knowledge", question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correctAnswer: "William Shakespeare", explanation: "Romeo and Juliet is a tragedy written by William Shakespeare." },
      { id: 10, category: "Language & Comprehension", question: "What is the antonym of 'Benevolent'?", options: ["Kind", "Cruel", "Generous", "Friendly"], correctAnswer: "Cruel", explanation: "Benevolent means well meaning and kindly; its opposite is cruel." }
    ];
    cachedQuiz['EN'] = fallbackQuiz;
    cachedQuizDate = today;
  }

  // Current affairs and Study Materials Mock Updates
  const mockCurrentAffairs = {
    id: Date.now(),
    mod: 'Current Affairs',
    title: `Daily News Update - ${today} (English/Hindi)`,
    status: 'Published'
  };
  const mockStudyMaterial = {
    id: Date.now() + 1,
    mod: 'Study Material',
    title: `New PYQ Release: UPSC/SSC ${new Date().getFullYear()} Official Papers`,
    status: 'Published'
  };
  
  globalState.content.unshift(mockCurrentAffairs, mockStudyMaterial);
  // Keep only the latest 50 items
  globalState.content = globalState.content.slice(0, 50);
  console.log('[CRON] Daily Current Affairs and Study Materials refreshed.');
  
  adminEvents.emit('metrics', {
    activeSessions: globalState.activeSessions,
    chatQueries: globalState.chatQueries,
    cpuUsage: 0,
    memoryUsage: 0
  });

  // 3. Exam Lifecycle Management
  // Remove past exams from global state and archive them
  const now = new Date();
  globalState.exams = globalState.exams.filter(exam => {
    // Basic heuristic for archiving: if examWindow has a past year
    const match = exam.examWindow.match(/20\d{2}/);
    if (match) {
      const year = parseInt(match[0]);
      if (year < now.getFullYear()) {
        console.log(`[CRON] Archiving past exam: ${exam.name}`);
        return false;
      }
    }
    return true;
  });
  console.log('[CRON] Exam lifecycle managed. Past exams archived.');
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();

export default app;
