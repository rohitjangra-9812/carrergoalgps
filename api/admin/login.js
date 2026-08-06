import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_admin_key_2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const username = req.body?.username;
    const password = req.body?.password;
       
    if (typeof username !== "string" || typeof password !== "string" || username.includes("$") || password.includes("$")) {
      return res.status(400).json({ error: "Invalid input format" });
    }

    if ((username === "admin" || username === "admin_core") && password === "core_gps_2026_portal") {
      const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "12h" });
      return res.json({ token, message: "Login successful" });
    } else {
      return res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
