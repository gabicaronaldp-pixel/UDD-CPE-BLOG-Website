import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("blog.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'Published',
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    author TEXT NOT NULL,
    designation TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id)
  );

  CREATE TABLE IF NOT EXISTS stats (
    key TEXT PRIMARY KEY,
    value INTEGER
  );
`);

// Seed data if empty
const postCount = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
if (postCount.count === 0) {
  db.prepare(`INSERT INTO posts (title, content, author, category, image_url, views) VALUES (?, ?, ?, ?, ?, ?)`).run(
    "The Future of Quantum Computing: Beyond Binary",
    "While classical computers have reached incredible heights, we are approaching the physical limits of silicon-based architecture. Quantum computing represents a paradigm shift, moving from bits to qubits...",
    "Dr. Aris Thorne",
    "Quantum Computing",
    "https://picsum.photos/seed/quantum/1200/600",
    1240
  );
  db.prepare(`INSERT INTO posts (title, content, author, category, image_url, views) VALUES (?, ?, ?, ?, ?, ?)`).run(
    "Edge AI: Deploying Models on Microcontrollers",
    "A deep dive into TinyML and how to optimize vision transformers for resource-constrained devices...",
    "Sarah Jenkins",
    "AI & ML",
    "https://picsum.photos/seed/edgeai/1200/600",
    850
  );
  db.prepare(`INSERT INTO posts (title, content, author, category, image_url, views) VALUES (?, ?, ?, ?, ?, ?)`).run(
    "ROS 2 Humble: What's New for Robotics Engineers",
    "Why you should migrate your projects to the latest LTS version and the performance gains in DDS middleware...",
    "Marcus Chen",
    "Robotics",
    "https://picsum.photos/seed/robotics/1200/600",
    920
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/posts", (req, res) => {
    const posts = db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
    res.json(posts);
  });

  app.get("/api/posts/:id", (req, res) => {
    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
    if (post) {
      db.prepare("UPDATE posts SET views = views + 1 WHERE id = ?").run(req.params.id);
      res.json(post);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  });

  app.post("/api/posts", (req, res) => {
    const { title, content, author, category, image_url, status } = req.body;
    const result = db.prepare(`INSERT INTO posts (title, content, author, category, image_url, status) VALUES (?, ?, ?, ?, ?, ?)`).run(
      title, content, author, category, image_url, status || 'Draft'
    );
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/posts/:id/comments", (req, res) => {
    const comments = db.prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC").all(req.params.id);
    res.json(comments);
  });

  app.post("/api/posts/:id/comments", (req, res) => {
    const { author, designation, content } = req.body;
    db.prepare(`INSERT INTO comments (post_id, author, designation, content) VALUES (?, ?, ?, ?)`).run(
      req.params.id, author, designation, content
    );
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    const totalPosts = db.prepare("SELECT COUNT(*) as count FROM posts").get() as any;
    const totalViews = db.prepare("SELECT SUM(views) as count FROM posts").get() as any;
    const totalComments = db.prepare("SELECT COUNT(*) as count FROM comments").get() as any;
    res.json({
      posts: totalPosts.count,
      views: totalViews.count || 0,
      comments: totalComments.count,
      subscribers: 1240 // Mocked for now
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
