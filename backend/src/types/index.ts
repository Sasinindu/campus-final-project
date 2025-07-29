// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any[];
    code?: string;
  };
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User types
export interface CreateUserDto {
  username: string;
  email?: string;
  password: string;
  role: 'doctor' | 'patient' | 'official';
  first_name: string;
  last_name: string;
  phone?: string;
  region?: string;
  hospital_id?: string;
  license_number?: string;
  specialization?: string;
}

export interface UpdateUserDto {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  region?: string;
  hospital_id?: string;
  license_number?: string;
  specialization?: string;
  is_active?: boolean;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Patient types
export interface CreatePatientDto {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  height_cm?: number;
  weight_kg?: number;
  emergency_contact?: string;
  emergency_contact_name?: string;
  address?: string;
  region?: string;
  primary_doctor_id?: number;
  insurance_number?: string;
}

export interface UpdatePatientDto {
  first_name?: string;
  last_name?: string;
  gender?: 'M' | 'F' | 'O';
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  height_cm?: number;
  weight_kg?: number;
  emergency_contact?: string;
  emergency_contact_name?: string;
  address?: string;
  region?: string;
  primary_doctor_id?: number;
  insurance_number?: string;
  is_active?: boolean;
}

// Health Metrics types
export interface CreateHealthMetricDto {
  patient_id: number;
  metric_type: string;
  systolic_pressure?: number;
  diastolic_pressure?: number;
  blood_sugar_fasting?: number;
  blood_sugar_random?: number;
  hba1c?: number;
  total_cholesterol?: number;
  hdl_cholesterol?: number;
  ldl_cholesterol?: number;
  triglycerides?: number;
  bmi?: number;
  weight_kg?: number;
  height_cm?: number;
  temperature_celsius?: number;
  heart_rate?: number;
  oxygen_saturation?: number;
  alt_enzyme?: number;
  ast_enzyme?: number;
  creatinine?: number;
  egfr?: number;
  notes?: string;
}

export interface UpdateHealthMetricDto {
  metric_type?: string;
  systolic_pressure?: number;
  diastolic_pressure?: number;
  blood_sugar_fasting?: number;
  blood_sugar_random?: number;
  hba1c?: number;
  total_cholesterol?: number;
  hdl_cholesterol?: number;
  ldl_cholesterol?: number;
  triglycerides?: number;
  bmi?: number;
  weight_kg?: number;
  height_cm?: number;
  temperature_celsius?: number;
  heart_rate?: number;
  oxygen_saturation?: number;
  alt_enzyme?: number;
  ast_enzyme?: number;
  creatinine?: number;
  egfr?: number;
  notes?: string;
}

// AI Prediction types
export interface CreateAIPredictionDto {
  patient_id: number;
  prediction_type: string;
  risk_level: 'low' | 'moderate' | 'high';
  risk_percentage: number;
  confidence_score?: number;
  factors?: string[];
  explanation?: string;
  recommendations?: string[];
  is_alert?: boolean;
}

export interface UpdateAIPredictionDto {
  risk_level?: 'low' | 'moderate' | 'high';
  risk_percentage?: number;
  confidence_score?: number;
  factors?: string[];
  explanation?: string;
  recommendations?: string[];
  is_alert?: boolean;
  reviewed_by?: number;
}

// Filter types
export interface PatientFilters {
  region?: string | undefined;
  doctor_id?: number | undefined;
  is_active?: boolean | undefined;
  search?: string | undefined;
}

export interface HealthMetricFilters {
  patient_id?: number;
  metric_type?: string;
  date_from?: string;
  date_to?: string;
}

export interface AIPredictionFilters {
  patient_id?: number;
  prediction_type?: string;
  risk_level?: string;
  is_alert?: boolean;
  reviewed?: boolean;
}

// Dashboard types
export interface DashboardSummary {
  totalPatients: {
    count: number;
    changeLastMonth: number;
  };
  aiPredictions: {
    total: number;
    highRiskCases: number;
  };
  highRiskAlerts: {
    total: number;
    newSinceYesterday: number;
  };
  healthMetrics: {
    total: number;
    changeThisWeek: number;
  };
}

export interface DoctorDashboardData {
  totalPatients: {
    count: number;
    changeLastMonth: number;
  };
  aiPredictions: {
    total: number;
    highRiskCases: number;
  };
  highRiskAlerts: {
    total: number;
    newSinceYesterday: number;
  };
  healthMetrics: {
    total: number;
    changeThisWeek: number;
  };
  my_patients: number;
  pending_appointments: number;
  recent_predictions: number;
  critical_metrics: any[];
}

export interface PatientDashboardData {
  recent_metrics: any[];
  recent_predictions: any[];
  upcoming_appointments: any[];
  active_medications: any[];
  alerts: any[];
}

export interface OfficialDashboardData {
  totalPatients: {
    count: number;
    changeLastMonth: number;
  };
  aiPredictions: {
    total: number;
    highRiskCases: number;
  };
  highRiskAlerts: {
    total: number;
    newSinceYesterday: number;
  };
  healthMetrics: {
    total: number;
    changeThisWeek: number;
  };
  regional_stats: any[];
  disease_prevalence: any[];
  population_health: any[];
}
