import type { Express } from "express";
import { db } from "../db";
import { shareholders, investments, optionPool } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  app.get("/api/shareholders", async (_, res) => {
    try {
      const results = await db.select().from(shareholders);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shareholders" });
    }
  });

  app.post("/api/shareholders", async (req, res) => {
    try {
      const result = await db.insert(shareholders).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to add shareholder" });
    }
  });

  app.get("/api/investments", async (_, res) => {
    try {
      const results = await db.select().from(investments);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investments" });
    }
  });

  app.post("/api/investments", async (req, res) => {
    try {
      const result = await db.insert(investments).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to add investment" });
    }
  });

  app.delete("/api/shareholders/:id", async (req, res) => {
    try {
      await db.delete(shareholders).where(eq(shareholders.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete shareholder" });
    }
  });
  app.get("/api/option-pool", async (_, res) => {
    try {
      const results = await db.select().from(optionPool).limit(1);
      res.json(results[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch option pool" });
    }
  });

  app.put("/api/option-pool", async (req, res) => {
    try {
      const result = await db
        .update(optionPool)
        .set({ size: req.body.size, lastUpdated: new Date() })
        .returning();
      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update option pool" });
    }
  });
}
