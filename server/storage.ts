import {
  users,
  patients,
  appointments,
  clinicalNotes,
  prescriptions,
  type User,
  type UpsertUser,
  type Patient,
  type InsertPatient,
  type Appointment,
  type InsertAppointment,
  type ClinicalNote,
  type InsertClinicalNote,
  type AppointmentWithPatient,
  type ClinicalNoteWithDetails,
  type Prescription,
  type InsertPrescription,
  type PrescriptionWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Patient operations
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient>;
  deletePatient(id: number): Promise<void>;
  searchPatients(query: string): Promise<Patient[]>;

  // Appointment operations
  getAppointments(): Promise<AppointmentWithPatient[]>;
  getAppointment(id: number): Promise<AppointmentWithPatient | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
  getAppointmentsByDate(date: string): Promise<AppointmentWithPatient[]>;
  getAppointmentsByDoctor(doctorId: string): Promise<AppointmentWithPatient[]>;
  getTodaysAppointments(): Promise<AppointmentWithPatient[]>;

  // Clinical Notes operations
  getClinicalNotes(): Promise<ClinicalNoteWithDetails[]>;
  getClinicalNote(id: number): Promise<ClinicalNoteWithDetails | undefined>;
  createClinicalNote(note: InsertClinicalNote): Promise<ClinicalNote>;
  updateClinicalNote(id: number, note: Partial<InsertClinicalNote>): Promise<ClinicalNote>;
  deleteClinicalNote(id: number): Promise<void>;
  getClinicalNotesByPatient(patientId: number): Promise<ClinicalNoteWithDetails[]>;

  // Prescription operations
  getPrescriptions(): Promise<PrescriptionWithDetails[]>;
  getPrescription(id: number): Promise<PrescriptionWithDetails | undefined>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription>;
  deletePrescription(id: number): Promise<void>;
  getPrescriptionsByPatient(patientId: number): Promise<PrescriptionWithDetails[]>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    todayAppointments: number;
    activePatients: number;
    pendingReports: number;
    monthlyRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Patient operations
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient> {
    const [updatedPatient] = await db
      .update(patients)
      .set({ ...patient, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return updatedPatient;
  }

  async deletePatient(id: number): Promise<void> {
    await db.delete(patients).where(eq(patients.id, id));
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return await db
      .select()
      .from(patients)
      .where(
        sql`lower(${patients.firstName}) LIKE ${`%${query.toLowerCase()}%`} OR 
            lower(${patients.lastName}) LIKE ${`%${query.toLowerCase()}%`} OR 
            lower(${patients.email}) LIKE ${`%${query.toLowerCase()}%`}`
      )
      .orderBy(desc(patients.createdAt));
  }

  // Appointment operations
  async getAppointments(): Promise<AppointmentWithPatient[]> {
    return await db
      .select()
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(users, eq(appointments.doctorId, users.id))
      .orderBy(desc(appointments.date), desc(appointments.time))
      .then(rows => 
        rows.map(row => ({
          ...row.appointments,
          patient: row.patients!,
          doctor: row.users!,
        }))
      );
  }

  async getAppointment(id: number): Promise<AppointmentWithPatient | undefined> {
    const [result] = await db
      .select()
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(users, eq(appointments.doctorId, users.id))
      .where(eq(appointments.id, id));

    if (!result) return undefined;

    return {
      ...result.appointments,
      patient: result.patients!,
      doctor: result.users!,
    };
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set({ ...appointment, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  async getAppointmentsByDate(date: string): Promise<AppointmentWithPatient[]> {
    return await db
      .select()
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(users, eq(appointments.doctorId, users.id))
      .where(eq(appointments.date, date))
      .orderBy(appointments.time)
      .then(rows => 
        rows.map(row => ({
          ...row.appointments,
          patient: row.patients!,
          doctor: row.users!,
        }))
      );
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<AppointmentWithPatient[]> {
    return await db
      .select()
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(users, eq(appointments.doctorId, users.id))
      .where(eq(appointments.doctorId, doctorId))
      .orderBy(desc(appointments.date), desc(appointments.time))
      .then(rows => 
        rows.map(row => ({
          ...row.appointments,
          patient: row.patients!,
          doctor: row.users!,
        }))
      );
  }

  async getTodaysAppointments(): Promise<AppointmentWithPatient[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointmentsByDate(today);
  }

  // Clinical Notes operations
  async getClinicalNotes(): Promise<ClinicalNoteWithDetails[]> {
    return await db
      .select()
      .from(clinicalNotes)
      .leftJoin(patients, eq(clinicalNotes.patientId, patients.id))
      .leftJoin(users, eq(clinicalNotes.doctorId, users.id))
      .leftJoin(appointments, eq(clinicalNotes.appointmentId, appointments.id))
      .orderBy(desc(clinicalNotes.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.clinical_notes,
          patient: row.patients!,
          doctor: row.users!,
          appointment: row.appointments || undefined,
        }))
      );
  }

  async getClinicalNote(id: number): Promise<ClinicalNoteWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(clinicalNotes)
      .leftJoin(patients, eq(clinicalNotes.patientId, patients.id))
      .leftJoin(users, eq(clinicalNotes.doctorId, users.id))
      .leftJoin(appointments, eq(clinicalNotes.appointmentId, appointments.id))
      .where(eq(clinicalNotes.id, id));

    if (!result) return undefined;

    return {
      ...result.clinical_notes,
      patient: result.patients!,
      doctor: result.users!,
      appointment: result.appointments || undefined,
    };
  }

  async createClinicalNote(note: InsertClinicalNote): Promise<ClinicalNote> {
    const [newNote] = await db.insert(clinicalNotes).values(note).returning();
    return newNote;
  }

  async updateClinicalNote(id: number, note: Partial<InsertClinicalNote>): Promise<ClinicalNote> {
    const [updatedNote] = await db
      .update(clinicalNotes)
      .set({ ...note, updatedAt: new Date() })
      .where(eq(clinicalNotes.id, id))
      .returning();
    return updatedNote;
  }

  async deleteClinicalNote(id: number): Promise<void> {
    await db.delete(clinicalNotes).where(eq(clinicalNotes.id, id));
  }

  async getClinicalNotesByPatient(patientId: number): Promise<ClinicalNoteWithDetails[]> {
    return await db
      .select()
      .from(clinicalNotes)
      .leftJoin(patients, eq(clinicalNotes.patientId, patients.id))
      .leftJoin(users, eq(clinicalNotes.doctorId, users.id))
      .leftJoin(appointments, eq(clinicalNotes.appointmentId, appointments.id))
      .where(eq(clinicalNotes.patientId, patientId))
      .orderBy(desc(clinicalNotes.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.clinical_notes,
          patient: row.patients!,
          doctor: row.users!,
          appointment: row.appointments || undefined,
        }))
      );
  }

  // Prescription operations
  async getPrescriptions(): Promise<PrescriptionWithDetails[]> {
    return await db
      .select()
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .leftJoin(users, eq(prescriptions.doctorId, users.id))
      .leftJoin(appointments, eq(prescriptions.appointmentId, appointments.id))
      .orderBy(desc(prescriptions.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.prescriptions,
          patient: row.patients!,
          doctor: row.users!,
          appointment: row.appointments || undefined,
        }))
      );
  }

  async getPrescription(id: number): Promise<PrescriptionWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .leftJoin(users, eq(prescriptions.doctorId, users.id))
      .leftJoin(appointments, eq(prescriptions.appointmentId, appointments.id))
      .where(eq(prescriptions.id, id));

    if (!result) return undefined;

    return {
      ...result.prescriptions,
      patient: result.patients!,
      doctor: result.users!,
      appointment: result.appointments || undefined,
    };
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const [newPrescription] = await db
      .insert(prescriptions)
      .values(prescription)
      .returning();
    return newPrescription;
  }

  async updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription> {
    const [updatedPrescription] = await db
      .update(prescriptions)
      .set({
        ...prescription,
        updatedAt: new Date(),
      })
      .where(eq(prescriptions.id, id))
      .returning();
    return updatedPrescription;
  }

  async deletePrescription(id: number): Promise<void> {
    await db.delete(prescriptions).where(eq(prescriptions.id, id));
  }

  async getPrescriptionsByPatient(patientId: number): Promise<PrescriptionWithDetails[]> {
    return await db
      .select()
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .leftJoin(users, eq(prescriptions.doctorId, users.id))
      .leftJoin(appointments, eq(prescriptions.appointmentId, appointments.id))
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.prescriptions,
          patient: row.patients!,
          doctor: row.users!,
          appointment: row.appointments || undefined,
        }))
      );
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    todayAppointments: number;
    activePatients: number;
    pendingReports: number;
    monthlyRevenue: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const [todayAppointmentsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(eq(appointments.date, today));

    const [activePatientsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients)
      .where(eq(patients.status, 'active'));

    const [pendingReportsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clinicalNotes)
      .where(eq(clinicalNotes.type, 'pending-report'));

    return {
      todayAppointments: Number(todayAppointmentsResult.count) || 0,
      activePatients: Number(activePatientsResult.count) || 0,
      pendingReports: Number(pendingReportsResult.count) || 0,
      monthlyRevenue: 47250, // Mock value for now
    };
  }
}

export const storage = new DatabaseStorage();
