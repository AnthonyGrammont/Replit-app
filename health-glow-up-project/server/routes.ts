import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeFoodImage, analyzeFoodText } from "./anthropic";
import { 
  insertUserProfileSchema, 
  insertFoodEntrySchema, 
  insertAppointmentSchema,
  insertMedicalDocumentSchema,
  type User 
} from "@shared/schema";
import { z } from "zod";

// Middleware for authentication (mock for now - would integrate with real auth)
const requireAuth = (req: any, res: any, next: any) => {
  // Mock user ID for development - in production this would verify JWT/session
  req.userId = "550e8400-e29b-41d4-a716-446655440000";
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // User Profile Routes
  app.get("/api/profile", requireAuth, async (req: any, res) => {
    try {
      const profile = await storage.getUserProfile(req.userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", requireAuth, async (req: any, res) => {
    try {
      const profileData = insertUserProfileSchema.parse({
        ...req.body,
        userId: req.userId
      });
      const profile = await storage.upsertUserProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Food Tracking Routes
  app.get("/api/food-entries", requireAuth, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const entries = await storage.getFoodEntries(req.userId, limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching food entries:", error);
      res.status(500).json({ message: "Failed to fetch food entries" });
    }
  });

  app.post("/api/food-entries", requireAuth, async (req: any, res) => {
    try {
      const entryData = insertFoodEntrySchema.parse({
        ...req.body,
        userId: req.userId
      });
      const entry = await storage.createFoodEntry(entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating food entry:", error);
      res.status(500).json({ message: "Failed to create food entry" });
    }
  });

  app.get("/api/food-entries/range", requireAuth, async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const entries = await storage.getFoodEntriesByDateRange(
        req.userId,
        new Date(startDate),
        new Date(endDate)
      );
      res.json(entries);
    } catch (error) {
      console.error("Error fetching food entries by date range:", error);
      res.status(500).json({ message: "Failed to fetch food entries" });
    }
  });

  // AI Food Analysis Routes
  app.post("/api/analyze-food-image", requireAuth, async (req: any, res) => {
    try {
      const { base64Image } = req.body;
      if (!base64Image) {
        return res.status(400).json({ message: "Base64 image is required" });
      }
      
      const analysis = await analyzeFoodImage(base64Image);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing food image:", error);
      res.status(500).json({ message: "Failed to analyze food image" });
    }
  });

  app.post("/api/analyze-food-text", requireAuth, async (req: any, res) => {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ message: "Food description is required" });
      }
      
      const analysis = await analyzeFoodText(description);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing food text:", error);
      res.status(500).json({ message: "Failed to analyze food description" });
    }
  });

  // HRV Data Routes
  app.get("/api/hrv-data", requireAuth, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const data = await storage.getHRVData(req.userId, limit);
      res.json(data);
    } catch (error) {
      console.error("Error fetching HRV data:", error);
      res.status(500).json({ message: "Failed to fetch HRV data" });
    }
  });

  app.post("/api/hrv-data", requireAuth, async (req: any, res) => {
    try {
      const hrvData = {
        ...req.body,
        userId: req.userId
      };
      const data = await storage.createHRVData(hrvData);
      res.json(data);
    } catch (error) {
      console.error("Error creating HRV data:", error);
      res.status(500).json({ message: "Failed to create HRV data" });
    }
  });

  // Appointment Routes
  app.get("/api/appointments", requireAuth, async (req: any, res) => {
    try {
      const appointments = await storage.getAppointments(req.userId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", requireAuth, async (req: any, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        patientId: req.userId
      });
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id/status", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateAppointmentStatus(parseInt(id), status);
      res.json({ message: "Appointment status updated" });
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  // Medical Document Routes
  app.get("/api/medical-documents", requireAuth, async (req: any, res) => {
    try {
      const documents = await storage.getMedicalDocuments(req.userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching medical documents:", error);
      res.status(500).json({ message: "Failed to fetch medical documents" });
    }
  });

  app.post("/api/medical-documents", requireAuth, async (req: any, res) => {
    try {
      const documentData = insertMedicalDocumentSchema.parse({
        ...req.body,
        userId: req.userId
      });
      const document = await storage.createMedicalDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Error creating medical document:", error);
      res.status(500).json({ message: "Failed to create medical document" });
    }
  });

  // AI Assistant Routes
  app.get("/api/ai-conversations", requireAuth, async (req: any, res) => {
    try {
      const conversations = await storage.getAIConversations(req.userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching AI conversations:", error);
      res.status(500).json({ message: "Failed to fetch AI conversations" });
    }
  });

  app.post("/api/ai-conversations", requireAuth, async (req: any, res) => {
    try {
      const conversationData = {
        ...req.body,
        userId: req.userId
      };
      const conversation = await storage.createAIConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating AI conversation:", error);
      res.status(500).json({ message: "Failed to create AI conversation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
