// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { supabase } from "@/integrations/supabase/client";

// Use untyped client to bypass generated type restrictions
const db = supabase as any;

// ─── BUSES ───────────────────────────────────────────────────────────────────

export async function fetchBuses() {
  const { data, error } = await db
    .from("buses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addBus(bus: any) {
  const { data, error } = await db
    .from("buses")
    .insert([{
      bus_number: bus.busNumber,
      route_number: bus.route || "",
      driver_full_name: bus.driver,
      driver_email: bus.driverEmail,
      driver_password: bus.driverPassword,
      driver_mobile: bus.driverPhone,
      stops: bus.stops || [],
      status: bus.status === "active" ? "available" : "maintenance",
      driver_photo_url: bus.photo || null,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBus(id: string, bus: any) {
  const { data, error } = await db
    .from("buses")
    .update({
      bus_number: bus.busNumber,
      route_number: bus.route || "",
      driver_full_name: bus.driver,
      driver_email: bus.driverEmail,
      driver_password: bus.driverPassword,
      driver_mobile: bus.driverPhone,
      stops: bus.stops || [],
      status: bus.status === "active" ? "available" : "maintenance",
      driver_photo_url: bus.photo || null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBus(id: string) {
  const { error } = await db.from("buses").delete().eq("id", id);
  if (error) throw error;
}

// Map Supabase bus row → app Bus format
export function mapBus(row: any) {
  return {
    id: row.id,
    busNumber: row.bus_number,
    route: row.route_number,
    driver: row.driver_full_name,
    driverEmail: row.driver_email,
    driverPassword: row.driver_password,
    driverPhone: row.driver_mobile,
    stops: row.stops || [],
    status: row.status === "available" ? "active" : "inactive",
    photo: row.driver_photo_url || "",
    students: 0,
    currentLocation: "Parking",
  };
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────

export async function fetchStudents() {
  const { data, error } = await db
    .from("approved_students")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addStudent(student: any) {
  const { data, error } = await db
    .from("approved_students")
    .insert([{
      full_name: student.name,
      email: student.email,
      password: student.password,
      student_id: student.rollNo,
      phone: student.phone,
      is_approved: student.status === "approved",
      pickup_address: student.pickupPoint || null,
      bus_id: student.assignedBusId ? String(student.assignedBusId) : null,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateStudent(id: string, student: any) {
  const { data, error } = await db
    .from("approved_students")
    .update({
      full_name: student.name,
      email: student.email,
      password: student.password,
      student_id: student.rollNo,
      phone: student.phone,
      is_approved: student.status === "approved",
      pickup_address: student.pickupPoint || null,
      bus_id: student.assignedBusId ? String(student.assignedBusId) : null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function approveStudent(id: string) {
  const { error } = await db
    .from("approved_students")
    .update({ is_approved: true })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteStudent(id: string) {
  const { error } = await db.from("approved_students").delete().eq("id", id);
  if (error) throw error;
}

// Map Supabase student row → app Student format
export function mapStudent(row: any) {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    password: row.password,
    rollNo: row.student_id,
    phone: row.phone,
    status: (row.is_approved ? "approved" : "pending") as "approved" | "pending",
    pickupPoint: row.pickup_address || "",
    assignedBusId: row.bus_id || undefined,
  };
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export async function loginDriver(email: string, password: string) {
  const { data, error } = await db
    .from("buses")
    .select("*")
    .eq("driver_email", email)
    .eq("driver_password", password)
    .single();
  if (error || !data) return null;
  return mapBus(data);
}

export async function loginStudent(email: string, password: string) {
  const { data, error } = await db
    .from("approved_students")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single();
  if (error || !data) return null;
  return mapStudent(data);
}
