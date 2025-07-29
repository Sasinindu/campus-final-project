# Health Test Reports System

## Overview

The Health Test Reports system is a comprehensive feature that allows patients to view, manage, and add their health test reports and metrics. This system provides both backend API endpoints and frontend components for a complete health monitoring solution.

## Backend Implementation

### 1. Database Entity

**File**: `backend/src/entities/HealthMetric.ts`

The `HealthMetric` entity stores various health metrics with the following structure:

```typescript
@Entity('health_metrics')
export class HealthMetric {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  patient_id!: number;

  @Column({ type: 'varchar', length: 50 })
  metric_type!: string;

  // Blood Pressure
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  systolic_pressure!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  diastolic_pressure!: number;

  // Blood Sugar
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  blood_sugar_fasting!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  blood_sugar_random!: number;

  // HbA1c
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  hba1c!: number;

  // Cholesterol
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  total_cholesterol!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  hdl_cholesterol!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  ldl_cholesterol!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  triglycerides!: number;

  // Anthropometric
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  bmi!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight_kg!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height_cm!: number;

  // Vital Signs
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  temperature_celsius!: number;

  @Column({ type: 'int', nullable: true })
  heart_rate!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  oxygen_saturation!: number;

  // Liver Function
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  alt_enzyme!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  ast_enzyme!: number;

  // Kidney Function
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  creatinine!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  egfr!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'int', nullable: true })
  recorded_by!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
```

### 2. Service Layer

**File**: `backend/src/services/HealthMetricService.ts`

The service provides the following methods:

- `getPatientHealthMetrics(patientId)`: Get all health metrics for a patient
- `getHealthMetricById(id)`: Get a specific health metric
- `createHealthMetric(metricData)`: Create a new health metric
- `updateHealthMetric(id, updateData)`: Update an existing health metric
- `deleteHealthMetric(id)`: Delete a health metric
- `getLatestHealthMetrics(patientId)`: Get the latest metrics for each type
- `getHealthMetricTrends(patientId)`: Get trend data for health metrics

### 3. Controller Layer

**File**: `backend/src/controllers/HealthMetricController.ts`

The controller handles HTTP requests and provides the following endpoints:

- `GET /api/health-metrics/patient/:patientId`: Get all health metrics for a patient
- `GET /api/health-metrics/patient/:patientId/latest`: Get latest health metrics
- `GET /api/health-metrics/patient/:patientId/trends`: Get health metric trends
- `GET /api/health-metrics/:id`: Get health metric by ID
- `POST /api/health-metrics`: Create new health metric
- `PUT /api/health-metrics/:id`: Update health metric
- `DELETE /api/health-metrics/:id`: Delete health metric

### 4. Routes

**File**: `backend/src/routes/healthMetrics.routes.ts`

All routes are protected with JWT authentication middleware.

## Frontend Implementation

### 1. Types and Interfaces

**File**: `frontend/src/types/healthMetrics.ts`

Defines TypeScript interfaces for:
- `HealthMetric`: Complete health metric structure
- `Patient`: Patient information
- `User`: User information
- `CreateHealthMetricRequest`: Request structure for creating metrics
- `UpdateHealthMetricRequest`: Request structure for updating metrics
- `MetricType`: Configuration for different metric types with normal ranges

### 2. Service Layer

**File**: `frontend/src/services/healthMetricsService.ts`

Provides API methods for:
- Getting patient health metrics
- Creating new health metrics
- Updating existing metrics
- Deleting metrics
- Getting latest metrics and trends

### 3. Components

#### AddHealthMetricForm Component

**File**: `frontend/src/components/health/AddHealthMetricForm.tsx`

Features:
- Dynamic form based on selected metric type
- Real-time validation against normal ranges
- Support for complex metrics (blood pressure, liver enzymes)
- Notes field for additional information
- Success/error feedback

#### HealthTestReports Component

**File**: `frontend/src/components/health/HealthTestReports.tsx`

Features:
- Displays all health metrics in a table format
- Status indicators (normal, high, low)
- Date formatting
- Empty state handling
- Integration with add form via dialog

### 4. Pages

#### PatientHealthReports Page

**File**: `frontend/src/pages/PatientHealthReports.tsx`

Features:
- Quick stats cards showing latest metrics
- Health test reports table
- Health tips section
- Responsive design

## Supported Metric Types

The system supports the following health metrics:

### Cardiovascular
- **Blood Pressure**: Systolic/Diastolic (mmHg)
  - Normal Range: 90-140 mmHg (systolic)

### Diabetes
- **Blood Sugar**: Fasting and Random (mg/dL)
  - Normal Range: 70-140 mg/dL
- **HbA1c**: Percentage
  - Normal Range: 4-6%

### Lipids
- **Total Cholesterol**: mg/dL
  - Normal Range: 125-200 mg/dL
- **HDL Cholesterol**: mg/dL
  - Normal Range: 40-60 mg/dL
- **LDL Cholesterol**: mg/dL
  - Normal Range: 0-100 mg/dL
- **Triglycerides**: mg/dL
  - Normal Range: 0-150 mg/dL

### Anthropometric
- **BMI**: kg/m²
  - Normal Range: 18.5-24.9 kg/m²
- **Weight**: kg
- **Height**: cm

### Vital Signs
- **Temperature**: °C
  - Normal Range: 36.1-37.2°C
- **Heart Rate**: bpm
  - Normal Range: 60-100 bpm
- **Oxygen Saturation**: %
  - Normal Range: 95-100%

### Liver Function
- **Liver Enzymes**: ALT/AST (U/L)
  - Normal Range: 7-56 U/L

### Kidney Function
- **Creatinine**: mg/dL
  - Normal Range: 0.6-1.2 mg/dL

## Features

### 1. Real-time Validation
- Normal range checking
- Visual indicators for abnormal values
- Color-coded status badges

### 2. Comprehensive Data Entry
- Support for complex metrics (blood pressure, liver enzymes)
- Optional notes field
- Date and time tracking

### 3. User-friendly Interface
- Responsive design
- Loading states
- Error handling
- Success feedback

### 4. Role-based Access
- Patients can view and add their own health metrics
- Doctors can view and manage patient metrics
- Officials can access aggregated data

## API Endpoints

### Authentication Required
All endpoints require valid JWT authentication.

### GET /api/health-metrics/patient/:patientId
Get all health metrics for a patient.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "patient_id": 1,
      "metric_type": "blood_pressure",
      "systolic_pressure": 120,
      "diastolic_pressure": 80,
      "created_at": "2024-01-15T10:30:00Z",
      "notes": "Routine check"
    }
  ],
  "message": "Health metrics retrieved successfully"
}
```

### POST /api/health-metrics
Create a new health metric.

**Request**:
```json
{
  "patient_id": 1,
  "metric_type": "blood_pressure",
  "systolic_pressure": 120,
  "diastolic_pressure": 80,
  "notes": "Routine check"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "patient_id": 1,
    "metric_type": "blood_pressure",
    "systolic_pressure": 120,
    "diastolic_pressure": 80,
    "created_at": "2024-01-15T10:30:00Z",
    "notes": "Routine check"
  },
  "message": "Health metric created successfully"
}
```

## Usage Examples

### Adding a Blood Pressure Reading
1. Navigate to Health Reports page
2. Click "Add Test Report"
3. Select "Blood Pressure" from the dropdown
4. Enter systolic and diastolic values
5. Add optional notes
6. Submit the form

### Viewing Health Trends
1. Access the health reports page
2. View the table of all test reports
3. Check status indicators for each metric
4. Review dates and notes

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Patients can only access their own data
3. **Input Validation**: All inputs are validated on both frontend and backend
4. **Data Sanitization**: All data is properly sanitized before storage

## Future Enhancements

1. **Trend Analysis**: Advanced trend visualization and analysis
2. **Alerts**: Automated alerts for abnormal values
3. **Export**: PDF report generation
4. **Integration**: Integration with external health devices
5. **AI Insights**: AI-powered health recommendations
6. **Mobile App**: Native mobile application
7. **Telemedicine**: Integration with video consultations

## Testing

### Backend Testing
```bash
# Run backend tests
cd backend
npm test
```

### Frontend Testing
```bash
# Run frontend tests
cd frontend
npm test
```

### Manual Testing
1. Start both backend and frontend servers
2. Login as a patient
3. Navigate to Health Reports
4. Add various test reports
5. Verify data persistence and display

## Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Environment Variables

### Backend
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: JWT signing secret
- `PORT`: Server port (default: 5000)

### Frontend
- `VITE_API_URL`: Backend API URL (default: http://localhost:5000)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS configuration includes frontend URL
2. **Authentication Errors**: Check JWT token validity and expiration
3. **Database Connection**: Verify database connection string and credentials
4. **API Endpoints**: Ensure all routes are properly registered

### Debug Mode

Enable debug logging in backend:
```typescript
// In backend/src/config/logger.ts
logger.level = 'debug';
```

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository. 