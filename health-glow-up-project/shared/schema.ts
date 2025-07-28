import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
  decimal,
  date,
  varchar,
  index,
  uuid,
  pgEnum
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userTypeEnum = pgEnum('user_type', ['patient', 'doctor', 'admin']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'completed', 'cancelled', 'rescheduled']);
export const reactionSeverityEnum = pgEnum('reaction_severity', ['mild', 'moderate', 'severe']);
export const accessLevelEnum = pgEnum('access_level', ['read', 'write', 'full']);

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: userTypeEnum("user_type").default('patient'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profiles with health data
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  age: integer("age"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  height: decimal("height", { precision: 5, scale: 2 }),
  sex: varchar("sex", { length: 10 }),
  bloodType: varchar("blood_type", { length: 5 }),
  emergencyContact: jsonb("emergency_contact"),
  medicalConditions: text("medical_conditions").array(),
  allergies: text("allergies").array(),
  medications: text("medications").array(),
  familyHistory: jsonb("family_history"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Family accounts - dependents
export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  primaryUserId: uuid("primary_user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  dependentUserId: uuid("dependent_user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  relationship: varchar("relationship", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// HRV tracking data
export const hrvData = pgTable("hrv_data", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  rmssd: decimal("rmssd", { precision: 8, scale: 3 }),
  pnn50: decimal("pnn50", { precision: 5, scale: 2 }),
  heartRate: integer("heart_rate"),
  stressLevel: integer("stress_level"),
  sourceDevice: varchar("source_device", { length: 100 }),
  sourceApi: varchar("source_api", { length: 50 }),
  rawData: jsonb("raw_data"),
});

// Food logging
export const foodEntries = pgTable("food_entries", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  mealType: varchar("meal_type", { length: 20 }),
  description: text("description"),
  imageUrl: varchar("image_url"),
  voiceTranscript: text("voice_transcript"),
  aiAnalysis: jsonb("ai_analysis"),
  calories: integer("calories"),
  nutrients: jsonb("nutrients"),
  moodBefore: integer("mood_before"),
  moodAfter: integer("mood_after"),
  energyBefore: integer("energy_before"),
  energyAfter: integer("energy_after"),
  digestionRating: integer("digestion_rating"),
});

// Food reactions tracking
export const foodReactions = pgTable("food_reactions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  foodEntryId: integer("food_entry_id").references(() => foodEntries.id, { onDelete: 'cascade' }),
  foodItem: varchar("food_item", { length: 200 }).notNull(),
  reactionType: varchar("reaction_type", { length: 100 }),
  severity: reactionSeverityEnum("severity").default('mild'),
  symptoms: text("symptoms").array(),
  timestamp: timestamp("timestamp").defaultNow(),
  notes: text("notes"),
});

// Medical documents vault
export const medicalDocuments = pgTable("medical_documents", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  fileUrl: varchar("file_url").notNull(),
  encryptedKey: varchar("encrypted_key"),
  uploadDate: timestamp("upload_date").defaultNow(),
  documentDate: date("document_date"),
  doctorName: varchar("doctor_name", { length: 100 }),
  facilityName: varchar("facility_name", { length: 200 }),
  tags: text("tags").array(),
  isShared: boolean("is_shared").default(false),
});

// Secure document sharing
export const documentShares = pgTable("document_shares", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => medicalDocuments.id, { onDelete: 'cascade' }).notNull(),
  sharedByUserId: uuid("shared_by_user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sharedWithUserId: uuid("shared_with_user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accessLevel: accessLevelEnum("access_level").default('read'),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  accessedAt: timestamp("accessed_at"),
});

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: uuid("patient_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  doctorId: uuid("doctor_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").default(30),
  status: appointmentStatusEnum("status").default('scheduled'),
  type: varchar("type", { length: 50 }),
  notes: text("notes"),
  videoCallUrl: varchar("video_call_url"),
  price: decimal("price", { precision: 10, scale: 2 }),
  isPaid: boolean("is_paid").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Doctor profiles
export const doctorProfiles = pgTable("doctor_profiles", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  specialization: varchar("specialization", { length: 100 }),
  licenseNumber: varchar("license_number", { length: 50 }),
  yearsExperience: integer("years_experience"),
  education: jsonb("education"),
  certifications: text("certifications").array(),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  availability: jsonb("availability"),
  bio: text("bio"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
});

// AI assistant conversations
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sessionId: uuid("session_id").default(sql`gen_random_uuid()`),
  messages: jsonb("messages").notNull(),
  symptoms: text("symptoms").array(),
  recommendations: jsonb("recommendations"),
  escalationFlag: boolean("escalation_flag").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  doctorProfile: one(doctorProfiles, { fields: [users.id], references: [doctorProfiles.userId] }),
  familyMembers: many(familyMembers),
  hrvData: many(hrvData),
  foodEntries: many(foodEntries),
  medicalDocuments: many(medicalDocuments),
  patientAppointments: many(appointments, { relationName: "patientAppointments" }),
  doctorAppointments: many(appointments, { relationName: "doctorAppointments" }),
  aiConversations: many(aiConversations),
  notifications: many(notifications),
}));

export const userProfileRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}));

export const appointmentRelations = relations(appointments, ({ one }) => ({
  patient: one(users, { fields: [appointments.patientId], references: [users.id], relationName: "patientAppointments" }),
  doctor: one(users, { fields: [appointments.doctorId], references: [users.id], relationName: "doctorAppointments" }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFoodEntrySchema = createInsertSchema(foodEntries).omit({
  id: true,
  timestamp: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicalDocumentSchema = createInsertSchema(medicalDocuments).omit({
  id: true,
  uploadDate: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type FoodEntry = typeof foodEntries.$inferSelect;
export type InsertFoodEntry = z.infer<typeof insertFoodEntrySchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type MedicalDocument = typeof medicalDocuments.$inferSelect;
export type InsertMedicalDocument = z.infer<typeof insertMedicalDocumentSchema>;
export type HRVData = typeof hrvData.$inferSelect;
export type FoodReaction = typeof foodReactions.$inferSelect;
export type DoctorProfile = typeof doctorProfiles.$inferSelect;
export type AIConversation = typeof aiConversations.$inferSelect;
