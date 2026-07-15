export const HOSPITAL = {
  name: "LifeCare Multispeciality Hospital",
  tagline: "Compassionate care, powered by innovation.",
  founded: 1998,
  phone: "+91 98765 43210",
  emergency: "108",
  emergencyAlt: "112",
  email: "care@lifecarehospital.in",
  address: "LifeCare Multispeciality Hospital, Near Bus Stand, Shirpur, Dhule, Maharashtra - 425405, India",
};

export const STATS = [
  { label: "Board-certified doctors", value: "250+" },
  { label: "Patients served", value: "1.2M" },
  { label: "Inpatient beds", value: "640" },
  { label: "Awards & accreditations", value: "38" },
];

export type Department = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  services: string[];
  hours: string;
  icon: string;
};

export const DEPARTMENTS: Department[] = [
  { slug: "cardiology", name: "Cardiology", tagline: "Advanced heart & vascular care", description: "Comprehensive diagnosis and treatment for heart disease, arrhythmias, and vascular conditions using the latest imaging and interventional techniques.", services: ["ECG & Echocardiography", "Cardiac Catheterization", "Angioplasty & Stenting", "Pacemaker Implantation", "Heart Failure Clinic"], hours: "24/7 Emergency · OPD: Mon–Sat 8am–8pm", icon: "Heart" },
  { slug: "neurology", name: "Neurology", tagline: "Brain, spine & nervous system", description: "Expert care for stroke, epilepsy, Parkinson's, multiple sclerosis, and complex neurological disorders with a dedicated Neuro-ICU.", services: ["Stroke Unit", "Epilepsy Monitoring", "EMG / NCS", "Movement Disorder Clinic", "Neuro Rehabilitation"], hours: "24/7 Emergency · OPD: Mon–Fri 9am–7pm", icon: "Brain" },
  { slug: "orthopedics", name: "Orthopedics", tagline: "Bones, joints & sports medicine", description: "Joint replacement, arthroscopy, spine surgery, and full-spectrum sports medicine, with same-day imaging and physiotherapy on-site.", services: ["Joint Replacement", "Arthroscopy", "Spine Surgery", "Sports Injury Clinic", "Physiotherapy"], hours: "OPD: Mon–Sat 8am–7pm", icon: "Bone" },
  { slug: "pediatrics", name: "Pediatrics", tagline: "Care from newborn to teen", description: "Family-friendly pediatric care including a Level III NICU, vaccination programs, and dedicated child-life specialists.", services: ["Well-Baby Clinic", "Vaccination", "Pediatric ICU", "NICU Level III", "Adolescent Care"], hours: "24/7 Emergency · OPD: Daily 8am–9pm", icon: "Baby" },
  { slug: "gynecology", name: "Gynecology & Obstetrics", tagline: "Women's health, every stage", description: "Full-service women's health from routine screening to high-risk obstetrics, IVF, and minimally invasive gynecologic surgery.", services: ["Prenatal Care", "High-Risk Obstetrics", "IVF & Fertility", "Laparoscopy", "Menopause Clinic"], hours: "24/7 Labor & Delivery · OPD: Mon–Sat 9am–6pm", icon: "Flower2" },
  { slug: "oncology", name: "Oncology", tagline: "Precision cancer care", description: "Multidisciplinary tumor boards, targeted therapies, immunotherapy, and radiation oncology with dedicated patient navigators.", services: ["Medical Oncology", "Radiation Oncology", "Chemotherapy Day Care", "Tumor Board", "Palliative Care"], hours: "OPD: Mon–Fri 8am–6pm", icon: "Ribbon" },
  { slug: "dermatology", name: "Dermatology", tagline: "Skin, hair & aesthetics", description: "Medical and cosmetic dermatology, laser treatments, and dedicated clinics for psoriasis, acne, and skin cancer screening.", services: ["Skin Cancer Screening", "Laser Therapy", "Cosmetic Dermatology", "Pediatric Dermatology", "Hair Restoration"], hours: "OPD: Mon–Sat 9am–6pm", icon: "Sparkles" },
  { slug: "ent", name: "ENT", tagline: "Ear, nose & throat specialists", description: "Diagnosis and surgery for hearing loss, sinus disease, sleep apnea, and pediatric ENT with in-house audiology.", services: ["Audiology", "Sinus Surgery", "Cochlear Implants", "Sleep Apnea Clinic", "Pediatric ENT"], hours: "OPD: Mon–Sat 8am–6pm", icon: "Ear" },
  { slug: "emergency", name: "Emergency Medicine", tagline: "24/7 Level I trauma center", description: "Level I trauma center with door-to-doctor times under 8 minutes, on-site CT, and dedicated resuscitation bays.", services: ["Trauma Care", "Cardiac Emergencies", "Stroke Response", "Pediatric ER", "Fast-Track Triage"], hours: "24/7 · 365 days", icon: "Siren" },
  { slug: "icu", name: "Critical Care (ICU)", tagline: "Intensive care for the sickest patients", description: "Multi-specialty ICU, CCU, and Neuro-ICU staffed by intensivists round-the-clock with the latest monitoring and ventilator technology.", services: ["Medical ICU", "Surgical ICU", "Cardiac ICU", "Neuro ICU", "Isolation Suites"], hours: "24/7", icon: "Activity" },
];

const FIRST_NAMES = ["Amelia","Noah","Priya","Marcus","Sofia","Ethan","Zara","Liam","Ava","Ravi","Elena","Kenji","Isla","Omar","Nia","Hiro","Maya","Diego","Aisha","Lukas","Sana","Jonas","Mira","Farah","Theo"];
const LAST_NAMES  = ["Chen","Okafor","Patel","Reyes","Nakamura","Hassan","Kowalski","Bernard","Vasquez","Kim","Andersson","Silva","Wagner","Delgado","Ito","Osei","Larsen","Kaur","Novak","Bianchi","Haddad","Meyer","Torres","Yamamoto","Rossi"];
const LANGS = [["English","Spanish"],["English","Mandarin"],["English","Hindi","Marathi"],["English","French"],["English","Arabic"],["English","Japanese"],["English","Portuguese"],["English","German"],["English","Korean"]];

function seed(i: number) { return (i * 9301 + 49297) % 233280; }

export type Doctor = {
  id: string;
  name: string;
  department: string;
  departmentSlug: string;
  qualification: string;
  experience: number;
  specialization: string;
  bio: string;
  fee: number;
  rating: number;
  reviews: number;
  languages: string[];
  schedule: { day: string; slots: string[] }[];
};

const SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat"];

export const DOCTORS: Doctor[] = Array.from({ length: 25 }, (_, i) => {
  const s = seed(i + 1);
  const first = FIRST_NAMES[i % FIRST_NAMES.length];
  const last = LAST_NAMES[(i * 3) % LAST_NAMES.length];
  const dept = DEPARTMENTS[i % DEPARTMENTS.length];
  const exp = 5 + (s % 26);
  const fee = 500 + ((s % 20) * 100);
  const rating = 4.4 + ((s % 6) / 10);
  return {
    id: `dr-${String(i + 1).padStart(2, "0")}`,
    name: `Dr. ${first} ${last}`,
    department: dept.name,
    departmentSlug: dept.slug,
    qualification: ["MD","MBBS, MD","MBBS, MD, DM","MBBS, MS","MD, PhD","MBBS, DNB"][s % 6],
    experience: exp,
    specialization: dept.tagline,
    bio: `Dr. ${first} ${last} is a board-certified ${dept.name.toLowerCase()} specialist with ${exp} years of clinical experience. Trained at leading academic hospitals, ${first} focuses on patient-centered care, evidence-based medicine, and integrating the latest research into everyday practice.`,
    fee,
    rating: Math.round(rating * 10) / 10,
    reviews: 40 + (s % 400),
    languages: LANGS[i % LANGS.length],
    schedule: DAYS.map((d, di) => ({
      day: d,
      slots: di === 6 ? [] : SLOTS.slice((s + di) % 6, ((s + di) % 6) + 4 + (di % 3)),
    })),
  };
});

export const SERVICES = [
  { icon: "Stethoscope", name: "OPD", description: "Same-day outpatient consultations across 30+ specialties." },
  { icon: "BedDouble", name: "Inpatient (IPD)", description: "640 comfortable beds with private and shared room options." },
  { icon: "Activity", name: "Critical Care (ICU)", description: "Multi-specialty ICU with 24/7 intensivist coverage." },
  { icon: "Pill", name: "Pharmacy", description: "24/7 in-house pharmacy with home delivery." },
  { icon: "FlaskConical", name: "Laboratory", description: "NABL-accredited pathology, imaging, and molecular labs." },
  { icon: "Ambulance", name: "Ambulance", description: "Fleet of 24 ambulances including two advanced cardiac units." },
  { icon: "HeartPulse", name: "Health Packages", description: "Preventive check-ups tailored by age, gender, and risk." },
  { icon: "Siren", name: "Emergency Care", description: "Level I trauma center with door-to-doctor under 8 minutes." },
  { icon: "Video", name: "Telemedicine", description: "Secure video consultations with any of our specialists." },
];

export const TESTIMONIALS = [
  { name: "Aarti J.", role: "Patient — Cardiology", quote: "From my first call to discharge, every person at LifeCare treated me like family. My surgeon explained everything and my recovery has been remarkable." },
  { name: "Rahul S.", role: "Parent — Pediatrics", quote: "The pediatric team calmed our whole family during a stressful night. Same-day imaging, gentle nurses — we couldn't have asked for more." },
  { name: "Priya D.", role: "Patient — Oncology", quote: "The tumor board reviewed my case within days. I've never felt more informed or supported through a diagnosis." },
];

export const NEWS = [
  { title: "LifeCare opens 40-bed advanced cardiac ICU", date: "May 2026", excerpt: "State-of-the-art monitoring, hybrid OR, and telemedicine consult rooms come online." },
  { title: "AI-assisted radiology cuts stroke read times in half", date: "April 2026", excerpt: "Our new imaging pipeline flags large-vessel occlusions in under 90 seconds." },
  { title: "Free women's health camp — 2,300 screenings", date: "March 2026", excerpt: "Our annual community outreach reached record participation this year." },
];

export const VALUES = [
  { title: "Patient First", body: "Every decision starts with what's best for the person in front of us." },
  { title: "Clinical Excellence", body: "Evidence-based medicine, tumor boards, and continuous peer review." },
  { title: "Compassion", body: "Small gestures, plain-language explanations, and time to listen." },
  { title: "Innovation", body: "AI-assisted diagnostics, robotic surgery, and next-gen imaging." },
];

export const TIMELINE = [
  { year: "1998", title: "Founded", body: "Opened as a 40-bed community hospital in Shirpur, Dhule." },
  { year: "2006", title: "First cardiac program", body: "Launched a dedicated cardiology and cardiac surgery service." },
  { year: "2014", title: "Level I trauma", body: "Certified as a Level I trauma center with 24/7 neurosurgery." },
  { year: "2020", title: "Telemedicine at scale", body: "Delivered 200,000 virtual visits during the pandemic response." },
  { year: "2026", title: "AI-native care", body: "Rolled out AI symptom triage and radiology across every department." },
];