import {
  users,
  userProfiles,
  foodEntries,
  hrvData,
  appointments,
  medicalDocuments,
  aiConversations,
  notifications,
  type User,
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type FoodEntry,
  type InsertFoodEntry,
  type HRVData,
  type Appointment,
  type InsertAppointment,
  type MedicalDocument,
  type InsertMedicalDocument,
  type AIConversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: InsertUser): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  
  // Food tracking operations
  createFoodEntry(entry: InsertFoodEntry): Promise<FoodEntry>;
  getFoodEntries(userId: string, limit?: number): Promise<FoodEntry[]>;
  getFoodEntriesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<FoodEntry[]>;
  
  // HRV data operations
  createHRVData(data: Omit<HRVData, 'id'>): Promise<HRVData>;
  getHRVData(userId: string, limit?: number): Promise<HRVData[]>;
  
  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(userId: string): Promise<Appointment[]>;
  updateAppointmentStatus(id: number, status: string): Promise<void>;
  
  // Medical document operations
  createMedicalDocument(document: InsertMedicalDocument): Promise<MedicalDocument>;
  getMedicalDocuments(userId: string): Promise<MedicalDocument[]>;
  
  // AI conversation operations
  createAIConversation(conversation: Omit<AIConversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIConversation>;
  getAIConversations(userId: string): Promise<AIConversation[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async upsertUserProfile(profileData: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db
      .insert(userProfiles)
      .values(profileData)
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          ...profileData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return profile;
  }

  // Food tracking operations
  async createFoodEntry(entryData: InsertFoodEntry): Promise<FoodEntry> {
    const [entry] = await db
      .insert(foodEntries)
      .values(entryData)
      .returning();
    return entry;
  }

  async getFoodEntries(userId: string, limit = 50): Promise<FoodEntry[]> {
    return await db
      .select()
      .from(foodEntries)
      .where(eq(foodEntries.userId, userId))
      .orderBy(desc(foodEntries.timestamp))
      .limit(limit);
  }

  async getFoodEntriesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<FoodEntry[]> {
    return await db
      .select()
      .from(foodEntries)
      .where(
        and(
          eq(foodEntries.userId, userId),
          gte(foodEntries.timestamp, startDate),
          lte(foodEntries.timestamp, endDate)
        )
      )
      .orderBy(desc(foodEntries.timestamp));
  }

  // HRV data operations
  async createHRVData(data: Omit<HRVData, 'id'>): Promise<HRVData> {
    const [hrvRecord] = await db
      .insert(hrvData)
      .values(data)
      .returning();
    return hrvRecord;
  }

  async getHRVData(userId: string, limit = 100): Promise<HRVData[]> {
    return await db
      .select()
      .from(hrvData)
      .where(eq(hrvData.userId, userId))
      .orderBy(desc(hrvData.timestamp))
      .limit(limit);
  }

  // Appointment operations
  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(appointmentData)
      .returning();
    return appointment;
  }

  async getAppointments(userId: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, userId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async updateAppointmentStatus(id: number, status: string): Promise<void> {
    await db
      .update(appointments)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(appointments.id, id));
  }

  // Medical document operations
  async createMedicalDocument(documentData: InsertMedicalDocument): Promise<MedicalDocument> {
    const [document] = await db
      .insert(medicalDocuments)
      .values(documentData)
      .returning();
    return document;
  }

  async getMedicalDocuments(userId: string): Promise<MedicalDocument[]> {
    return await db
      .select()
      .from(medicalDocuments)
      .where(eq(medicalDocuments.userId, userId))
      .orderBy(desc(medicalDocuments.uploadDate));
  }

  // AI conversation operations
  async createAIConversation(conversationData: Omit<AIConversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIConversation> {
    const [conversation] = await db
      .insert(aiConversations)
      .values(conversationData)
      .returning();
    return conversation;
  }

  async getAIConversations(userId: string): Promise<AIConversation[]> {
    return await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.createdAt));
  }
}

export const storage = new DatabaseStorage();
