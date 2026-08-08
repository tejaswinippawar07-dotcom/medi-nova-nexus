import type { Field } from "@/components/hms/CrudManager";
import { StatusCell } from "@/components/hms/CrudManager";
import { labelFor, type Option } from "@/lib/hospital/lookups";

const opts = (...values: string[]): Option[] => values.map((v) => ({ value: v, label: v[0]!.toUpperCase() + v.slice(1) }));

export const inr = (v: unknown) => (v === null || v === undefined ? "—" : `₹${Number(v).toLocaleString("en-IN")}`);

/** DD/MM/YYYY, as used across the hospital. */
export const formatDate = (v: unknown) => {
  if (!v) return "—";
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const patientFields: Field[] = [
  { key: "uhid", label: "UHID", readOnly: true },
  { key: "full_name", label: "Full name", required: true },
  { key: "gender", label: "Gender", type: "select", options: opts("male", "female", "other") },
  { key: "date_of_birth", label: "Date of birth", type: "date", render: (r) => formatDate(r["date_of_birth"]) },
  { key: "blood_group", label: "Blood group", type: "select", options: opts("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-") },
  { key: "mobile", label: "Mobile", required: true, placeholder: "+91 98765 43210" },
  { key: "email", label: "Email", type: "email", hideInTable: true },
  { key: "address", label: "Address", type: "textarea", hideInTable: true },
  { key: "city", label: "City", placeholder: "Shirpur" },
  { key: "state", label: "State", hideInTable: true, placeholder: "Maharashtra" },
  { key: "pin_code", label: "PIN code", hideInTable: true, placeholder: "425405" },
  { key: "emergency_contact", label: "Emergency contact", hideInTable: true },
];

export const departmentFields: Field[] = [
  { key: "department_name", label: "Department", required: true },
  { key: "slug", label: "Slug", required: true, placeholder: "cardiology" },
  { key: "icon", label: "Icon", hideInTable: true, placeholder: "Heart" },
  { key: "description", label: "Description", type: "textarea" },
];

export const doctorFields = (departments: Option[]): Field[] => [
  { key: "name", label: "Name", required: true },
  { key: "slug", label: "Slug", required: true, hideInTable: true },
  { key: "department_id", label: "Department", type: "select", options: departments, render: (r) => labelFor(departments, r["department_id"]) },
  { key: "specialization", label: "Specialization", required: true },
  { key: "qualification", label: "Qualification" },
  { key: "experience", label: "Experience (yrs)", type: "number" },
  { key: "consultation_fee", label: "Fee", type: "number", render: (r) => inr(r["consultation_fee"]) },
  { key: "availability", label: "Availability", hideInTable: true },
  { key: "languages", label: "Languages", hideInTable: true },
  { key: "phone", label: "Phone", hideInTable: true },
  { key: "email", label: "Email", type: "email", hideInTable: true },
  { key: "bio", label: "Biography", type: "textarea", hideInTable: true },
];

export const staffFields = (departments: Option[]): Field[] => [
  { key: "name", label: "Name", required: true },
  { key: "designation", label: "Designation", required: true, placeholder: "Staff nurse" },
  { key: "department_id", label: "Department", type: "select", options: departments, render: (r) => labelFor(departments, r["department_id"]) },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email", type: "email", hideInTable: true },
  { key: "salary", label: "Monthly salary", type: "number", render: (r) => inr(r["salary"]) },
  { key: "joined_on", label: "Joined on", type: "date", render: (r) => formatDate(r["joined_on"]) },
];

export const appointmentFields = (doctors: Option[], departments: Option[], patients: Option[]): Field[] => [
  { key: "doctor_name", label: "Doctor", required: true },
  { key: "department", label: "Department", required: true },
  { key: "appointment_date", label: "Date", type: "date", required: true, render: (r) => formatDate(r["appointment_date"]) },
  { key: "appointment_time", label: "Time", required: true, placeholder: "10:30" },
  { key: "status", label: "Status", type: "select", options: opts("pending", "confirmed", "completed", "cancelled"), render: (r) => <StatusCell value={r["status"]} /> },
  { key: "doctor_slug", label: "Doctor slug", required: true, hideInTable: true },
  { key: "doctor_id", label: "Doctor record", type: "select", options: doctors, hideInTable: true },
  { key: "department_id", label: "Department record", type: "select", options: departments, hideInTable: true },
  { key: "patient_record_id", label: "Patient record", type: "select", options: patients, render: (r) => labelFor(patients, r["patient_record_id"]) },
  { key: "reason", label: "Reason", type: "textarea", hideInTable: true },
  { key: "notes", label: "Clinical notes", type: "textarea", hideInTable: true },
];

export const admissionFields = (patients: Option[]): Field[] => [
  { key: "patient_id", label: "Patient", type: "select", options: patients, required: true, render: (r) => labelFor(patients, r["patient_id"]) },
  { key: "ward", label: "Ward", required: true, placeholder: "General / ICU" },
  { key: "room_number", label: "Room", required: true },
  { key: "admission_date", label: "Admitted", type: "date", render: (r) => formatDate(r["admission_date"]) },
  { key: "discharge_date", label: "Discharged", type: "date", render: (r) => formatDate(r["discharge_date"]) },
  { key: "status", label: "Status", type: "select", options: opts("admitted", "discharged", "transferred"), render: (r) => <StatusCell value={r["status"]} /> },
  { key: "notes", label: "Notes", type: "textarea", hideInTable: true },
];

export const medicineFields: Field[] = [
  { key: "medicine_name", label: "Medicine", required: true },
  { key: "manufacturer", label: "Manufacturer" },
  { key: "quantity", label: "In stock", type: "number" },
  { key: "price", label: "Unit price", type: "number", render: (r) => inr(r["price"]) },
  { key: "expiry_date", label: "Expiry", type: "date", render: (r) => formatDate(r["expiry_date"]) },
];

export const billingFields = (patients: Option[]): Field[] => [
  { key: "bill_number", label: "Bill no.", readOnly: true },
  { key: "patient_id", label: "Patient", type: "select", options: patients, required: true, render: (r) => labelFor(patients, r["patient_id"]) },
  { key: "consultation_fee", label: "Consultation", type: "number", render: (r) => inr(r["consultation_fee"]) },
  { key: "medicine_cost", label: "Pharmacy", type: "number", render: (r) => inr(r["medicine_cost"]) },
  { key: "room_charges", label: "Room", type: "number", render: (r) => inr(r["room_charges"]) },
  { key: "laboratory_charges", label: "Laboratory", type: "number", render: (r) => inr(r["laboratory_charges"]) },
  { key: "other_charges", label: "Other", type: "number", hideInTable: true },
  { key: "total_amount", label: "Total", readOnly: true, render: (r) => inr(r["total_amount"]) },
  { key: "payment_status", label: "Status", type: "select", options: opts("unpaid", "partial", "paid"), render: (r) => <StatusCell value={r["payment_status"]} /> },
  { key: "payment_method", label: "Method", type: "select", options: opts("cash", "upi", "card", "insurance"), hideInTable: true },
  { key: "bill_date", label: "Date", type: "date", render: (r) => formatDate(r["bill_date"]) },
];

export const ambulanceFields: Field[] = [
  { key: "vehicle_number", label: "Vehicle", required: true, placeholder: "MH18-AB-1204" },
  { key: "driver_name", label: "Driver", required: true },
  { key: "phone", label: "Phone", required: true },
  { key: "status", label: "Status", type: "select", options: opts("available", "on-duty", "maintenance"), render: (r) => <StatusCell value={r["status"]} /> },
];

export const contactFields: Field[] = [
  { key: "name", label: "Name", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "phone", label: "Phone" },
  { key: "subject", label: "Subject" },
  { key: "message", label: "Message", type: "textarea", required: true },
  { key: "created_at", label: "Received", readOnly: true, render: (r) => formatDate(r["created_at"]) },
];

export const auditFields: Field[] = [
  { key: "created_at", label: "When", readOnly: true, render: (r) => formatDate(r["created_at"]) },
  { key: "action", label: "Action", readOnly: true },
  { key: "table_name", label: "Record type", readOnly: true },
  { key: "record_id", label: "Record id", readOnly: true },
];

export const reportFields = (patients: Option[], doctors: Option[]): Field[] => [
  { key: "title", label: "Report title", required: true, placeholder: "Lipid profile" },
  { key: "patient_id", label: "Patient", type: "select", options: patients, required: true, render: (r) => labelFor(patients, r["patient_id"]) },
  { key: "doctor_id", label: "Doctor", type: "select", options: doctors, render: (r) => labelFor(doctors, r["doctor_id"]) },
  { key: "report_type", label: "Type", type: "select", options: opts("laboratory", "radiology", "pathology", "discharge summary") },
  { key: "status", label: "Status", type: "select", options: opts("pending", "ready"), render: (r) => <StatusCell value={r["status"]} /> },
  { key: "file_url", label: "File link", placeholder: "https://…", hideInTable: true },
  { key: "notes", label: "Findings", type: "textarea", hideInTable: true },
  { key: "created_at", label: "Uploaded", readOnly: true, render: (r) => formatDate(r["created_at"]) },
];

export const prescriptionFields = (patients: Option[], doctors: Option[]): Field[] => [
  { key: "patient_id", label: "Patient", type: "select", options: patients, required: true, render: (r) => labelFor(patients, r["patient_id"]) },
  { key: "doctor_id", label: "Doctor", type: "select", options: doctors, render: (r) => labelFor(doctors, r["doctor_id"]) },
  { key: "notes", label: "Advice", type: "textarea" },
  { key: "created_at", label: "Issued", readOnly: true, render: (r) => formatDate(r["created_at"]) },
];

const legacyAuditFields: Field[] = [
  { key: "created_at", label: "When", readOnly: true, render: (r) => formatDate(r["created_at"]) },
  { key: "action", label: "Action", readOnly: true },
  { key: "table_name", label: "Record type", readOnly: true },
  { key: "record_id", label: "Record id", readOnly: true },
];