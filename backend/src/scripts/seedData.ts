import { AppDataSource } from '../config/database';
import { Medication } from '../entities/Medication';
import { Patient, Gender, BloodType } from '../entities/Patient';
import { User } from '../entities/User';
import { AIPrediction, RiskLevel } from '../entities/AIPrediction';
import { HealthMetric } from '../entities/HealthMetric';
import * as bcrypt from 'bcryptjs';

async function seedData() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    // Get repositories
    const medicationRepository = AppDataSource.getRepository(Medication);
    const patientRepository = AppDataSource.getRepository(Patient);
    const userRepository = AppDataSource.getRepository(User);
    const aiPredictionRepository = AppDataSource.getRepository(AIPrediction);
    const healthMetricRepository = AppDataSource.getRepository(HealthMetric);

    // Create sample users (doctors and patients)
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      // Patients
      {
        name: 'john_doe',
        email: 'john.doe@example.com',
        password_hash: hashedPassword,
        userRole: 'patient',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+94-11-234-5678',
        region: 'Colombo',
        isActive: true
      },
      {
        name: 'anita_kumar',
        email: 'anita.kumar@example.com',
        password_hash: hashedPassword,
        userRole: 'patient',
        first_name: 'Anita',
        last_name: 'Kumar',
        phone: '+94-11-234-5679',
        region: 'Kandy',
        isActive: true
      },
      {
        name: 'nimal_silva',
        email: 'nimal.silva@example.com',
        password_hash: hashedPassword,
        userRole: 'patient',
        first_name: 'Nimal',
        last_name: 'Silva',
        phone: '+94-11-234-5680',
        region: 'Galle',
        isActive: true
      },
      {
        name: 'wimal_fernando',
        email: 'wimal.fernando@example.com',
        password_hash: hashedPassword,
        userRole: 'patient',
        first_name: 'Wimal',
        last_name: 'Fernando',
        phone: '+94-11-234-5681',
        region: 'Colombo',
        isActive: true
      },
      {
        name: 'malini_perera',
        email: 'malini.perera@example.com',
        password_hash: hashedPassword,
        userRole: 'patient',
        first_name: 'Malini',
        last_name: 'Perera',
        phone: '+94-11-234-5682',
        region: 'Jaffna',
        isActive: true
      },
      // Doctors
      {
        name: 'dr_sunil',
        email: 'dr.sunil@hospital.com',
        password_hash: hashedPassword,
        userRole: 'doctor',
        first_name: 'Sunil',
        last_name: 'Perera',
        phone: '+94-11-345-6789',
        region: 'Colombo',
        hospital_id: 'H001',
        license_number: 'MD001',
        specialization: 'Endocrinologist',
        isActive: true
      },
      {
        name: 'dr_amali',
        email: 'dr.amali@hospital.com',
        password_hash: hashedPassword,
        userRole: 'doctor',
        first_name: 'Amali',
        last_name: 'Fernando',
        phone: '+94-11-456-7890',
        region: 'Kandy',
        hospital_id: 'H002',
        license_number: 'MD002',
        specialization: 'Hepatologist',
        isActive: true
      }
    ];

    // Create users
    const createdUsers: User[] = [];
    for (const userData of users) {
      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);
      createdUsers.push(savedUser);
      console.log(`Created user: ${userData.first_name} ${userData.last_name}`);
    }

    const patientUsers = createdUsers.filter(u => u.userRole === 'patient');
    const doctor1 = createdUsers.find(u => u.first_name === 'Sunil');
    const doctor2 = createdUsers.find(u => u.first_name === 'Amali');

    if (!doctor1) {
      console.log('Failed to create required doctor');
      return;
    }

    // Create multiple patients
    const patientsData = [
      {
        patient_id: 'P-001',
        user_id: patientUsers[0].id,
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: new Date('1985-03-15'),
        gender: Gender.MALE,
        blood_type: BloodType.O_POSITIVE,
        height_cm: 175,
        weight_kg: 80,
        emergency_contact: '+94-11-999-8888',
        emergency_contact_name: 'Jane Doe',
        address: '123 Main Street, Colombo 03',
        region: 'Colombo',
        primary_doctor_id: doctor1.id,
        insurance_number: 'INS001',
        is_active: true
      },
      {
        patient_id: 'P-002',
        user_id: patientUsers[1].id,
        first_name: 'Anita',
        last_name: 'Kumar',
        date_of_birth: new Date('1978-07-22'),
        gender: Gender.FEMALE,
        blood_type: BloodType.A_POSITIVE,
        height_cm: 162,
        weight_kg: 65,
        emergency_contact: '+94-11-999-8889',
        emergency_contact_name: 'Raj Kumar',
        address: '456 Lake Road, Kandy',
        region: 'Kandy',
        primary_doctor_id: doctor1.id,
        insurance_number: 'INS002',
        is_active: true
      },
      {
        patient_id: 'P-003',
        user_id: patientUsers[2].id,
        first_name: 'Nimal',
        last_name: 'Silva',
        date_of_birth: new Date('1965-11-08'),
        gender: Gender.MALE,
        blood_type: BloodType.B_POSITIVE,
        height_cm: 180,
        weight_kg: 85,
        emergency_contact: '+94-11-999-8890',
        emergency_contact_name: 'Sita Silva',
        address: '789 Beach Road, Galle',
        region: 'Galle',
        primary_doctor_id: doctor2?.id || doctor1.id,
        insurance_number: 'INS003',
        is_active: true
      },
      {
        patient_id: 'P-004',
        user_id: patientUsers[3].id,
        first_name: 'Wimal',
        last_name: 'Fernando',
        date_of_birth: new Date('1990-04-12'),
        gender: Gender.MALE,
        blood_type: BloodType.AB_POSITIVE,
        height_cm: 168,
        weight_kg: 72,
        emergency_contact: '+94-11-999-8891',
        emergency_contact_name: 'Lakshmi Fernando',
        address: '321 Temple Road, Colombo 04',
        region: 'Colombo',
        primary_doctor_id: doctor2?.id || doctor1.id,
        insurance_number: 'INS004',
        is_active: true
      },
      {
        patient_id: 'P-005',
        user_id: patientUsers[4].id,
        first_name: 'Malini',
        last_name: 'Perera',
        date_of_birth: new Date('1982-09-30'),
        gender: Gender.FEMALE,
        blood_type: BloodType.O_NEGATIVE,
        height_cm: 155,
        weight_kg: 58,
        emergency_contact: '+94-11-999-8892',
        emergency_contact_name: 'Priya Perera',
        address: '654 University Road, Jaffna',
        region: 'Jaffna',
        primary_doctor_id: doctor1.id,
        insurance_number: 'INS005',
        is_active: true
      }
    ];

    const createdPatients: Patient[] = [];
    for (const patientData of patientsData) {
      const patient = patientRepository.create(patientData);
      const savedPatient = await patientRepository.save(patient);
      createdPatients.push(savedPatient);
      console.log(`Created patient: ${patientData.first_name} ${patientData.last_name}`);
    }

    // Create sample medications for each patient
    const medications = [
      {
        patient_id: createdPatients[0].id,
        prescribed_by: doctor1.id,
        medication_name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily with meals',
        start_date: new Date('2024-01-15'),
        instructions: 'Take with food to reduce stomach upset',
        is_active: true
      },
      {
        patient_id: createdPatients[0].id,
        prescribed_by: doctor1.id,
        medication_name: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily at bedtime',
        start_date: new Date('2024-02-01'),
        instructions: 'Take at night for better effectiveness',
        is_active: true
      },
      {
        patient_id: createdPatients[1].id,
        prescribed_by: doctor1.id,
        medication_name: 'Insulin Glargine',
        dosage: '10 units',
        frequency: 'Once daily at bedtime',
        start_date: new Date('2024-03-01'),
        instructions: 'Inject subcutaneously in the evening',
        is_active: true
      },
      {
        patient_id: createdPatients[2].id,
        prescribed_by: doctor2?.id || doctor1.id,
        medication_name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily in the morning',
        start_date: new Date('2024-01-20'),
        instructions: 'Take on empty stomach',
        is_active: true
      },
      {
        patient_id: createdPatients[3].id,
        prescribed_by: doctor2?.id || doctor1.id,
        medication_name: 'Omeprazole',
        dosage: '20mg',
        frequency: 'Once daily before breakfast',
        start_date: new Date('2024-02-15'),
        instructions: 'Take 30 minutes before meals',
        is_active: true
      }
    ];

    // Create sample AI predictions for each patient
    const aiPredictions = [
      {
        patient_id: createdPatients[0].id,
        prediction_type: 'Type 2 Diabetes',
        risk_level: RiskLevel.MODERATE,
        risk_percentage: 65.5,
        confidence_score: 0.85,
        factors: [
          'Elevated fasting blood glucose (125 mg/dL)',
          'Family history of diabetes',
          'BMI of 26.1 (Overweight)',
          'Sedentary lifestyle'
        ],
        explanation: 'Patient shows early signs of insulin resistance with elevated fasting glucose levels.',
        recommendations: [
          'Increase physical activity to 150 minutes per week',
          'Reduce refined carbohydrate intake',
          'Monitor blood glucose levels regularly',
          'Consider medication if lifestyle changes insufficient'
        ],
        is_alert: true,
        is_reviewed: false
      },
      {
        patient_id: createdPatients[0].id,
        prediction_type: 'Fatty Liver Disease',
        risk_level: RiskLevel.HIGH,
        risk_percentage: 78.2,
        confidence_score: 0.92,
        factors: [
          'Elevated ALT enzymes (72 U/L)',
          'Central obesity',
          'Insulin resistance markers',
          'High triglyceride levels'
        ],
        explanation: 'Liver function tests indicate early-stage non-alcoholic fatty liver disease.',
        recommendations: [
          'Implement weight loss program',
          'Reduce alcohol consumption',
          'Monitor liver enzymes quarterly',
          'Consider hepatologist consultation'
        ],
        is_alert: true,
        is_reviewed: false
      },
      {
        patient_id: createdPatients[1].id,
        prediction_type: 'Type 1 Diabetes',
        risk_level: RiskLevel.HIGH,
        risk_percentage: 85.3,
        confidence_score: 0.88,
        factors: [
          'Autoimmune markers present',
          'Family history of type 1 diabetes',
          'Recent weight loss',
          'Elevated ketone levels'
        ],
        explanation: 'Patient shows classic symptoms of type 1 diabetes with autoimmune markers.',
        recommendations: [
          'Immediate insulin therapy required',
          'Blood glucose monitoring 4-6 times daily',
          'Carbohydrate counting education',
          'Endocrinologist consultation'
        ],
        is_alert: true,
        is_reviewed: false
      },
      {
        patient_id: createdPatients[2].id,
        prediction_type: 'Hypertension',
        risk_level: RiskLevel.MODERATE,
        risk_percentage: 72.1,
        confidence_score: 0.79,
        factors: [
          'Blood pressure 145/95 mmHg',
          'Family history of hypertension',
          'High sodium diet',
          'Stressful lifestyle'
        ],
        explanation: 'Patient has stage 1 hypertension with multiple risk factors.',
        recommendations: [
          'Reduce sodium intake to <2g daily',
          'Implement DASH diet',
          'Regular blood pressure monitoring',
          'Stress management techniques'
        ],
        is_alert: false,
        is_reviewed: false
      },
      {
        patient_id: createdPatients[3].id,
        prediction_type: 'Gastroesophageal Reflux Disease',
        risk_level: RiskLevel.LOW,
        risk_percentage: 45.2,
        confidence_score: 0.76,
        factors: [
          'Frequent heartburn',
          'Acid reflux symptoms',
          'Dietary triggers',
          'Stress-related symptoms'
        ],
        explanation: 'Patient shows symptoms consistent with GERD.',
        recommendations: [
          'Avoid trigger foods',
          'Elevate head of bed',
          'Eat smaller, more frequent meals',
          'Consider PPI therapy'
        ],
        is_alert: false,
        is_reviewed: false
      },
      {
        patient_id: createdPatients[4].id,
        prediction_type: 'Osteoporosis',
        risk_level: RiskLevel.MODERATE,
        risk_percentage: 58.7,
        confidence_score: 0.82,
        factors: [
          'Low bone density on DXA scan',
          'Post-menopausal status',
          'Family history of osteoporosis',
          'Low calcium intake'
        ],
        explanation: 'Patient has osteopenia with risk factors for progression to osteoporosis.',
        recommendations: [
          'Calcium and vitamin D supplementation',
          'Weight-bearing exercise program',
          'Bone density monitoring annually',
          'Fall prevention measures'
        ],
        is_alert: false,
        is_reviewed: false
      }
    ];

    // Create sample health metrics for each patient
    const healthMetrics = [
      {
        patient_id: createdPatients[0].id,
        metric_type: 'blood_glucose',
        value: 125,
        unit: 'mg/dL',
        recorded_at: new Date('2024-03-15T08:00:00'),
        notes: 'Fasting blood glucose'
      },
      {
        patient_id: createdPatients[0].id,
        metric_type: 'blood_pressure',
        value: 140,
        unit: 'mmHg',
        recorded_at: new Date('2024-03-15T08:00:00'),
        notes: 'Systolic blood pressure'
      },
      {
        patient_id: createdPatients[1].id,
        metric_type: 'blood_glucose',
        value: 280,
        unit: 'mg/dL',
        recorded_at: new Date('2024-03-14T09:00:00'),
        notes: 'Random blood glucose - elevated'
      },
      {
        patient_id: createdPatients[2].id,
        metric_type: 'blood_pressure',
        value: 145,
        unit: 'mmHg',
        recorded_at: new Date('2024-03-13T10:00:00'),
        notes: 'Systolic blood pressure - elevated'
      },
      {
        patient_id: createdPatients[3].id,
        metric_type: 'weight',
        value: 72,
        unit: 'kg',
        recorded_at: new Date('2024-03-12T11:00:00'),
        notes: 'Current weight'
      },
      {
        patient_id: createdPatients[4].id,
        metric_type: 'bone_density',
        value: -2.1,
        unit: 'T-score',
        recorded_at: new Date('2024-03-11T14:00:00'),
        notes: 'DXA scan result - osteopenia'
      }
    ];

    // Insert medications
    for (const medicationData of medications) {
      const medication = medicationRepository.create(medicationData);
      await medicationRepository.save(medication);
      console.log(`Created medication: ${medicationData.medication_name}`);
    }

    // Insert AI predictions
    for (const predictionData of aiPredictions) {
      const prediction = aiPredictionRepository.create(predictionData);
      await aiPredictionRepository.save(prediction);
      console.log(`Created AI prediction: ${predictionData.prediction_type}`);
    }

    // Insert health metrics
    for (const metricData of healthMetrics) {
      const metric = healthMetricRepository.create(metricData);
      await healthMetricRepository.save(metric);
      console.log(`Created health metric: ${metricData.metric_type}`);
    }

    console.log('Sample data seeded successfully!');
    console.log('Login credentials:');
    console.log('Patient 1: john.doe@example.com / password123');
    console.log('Patient 2: anita.kumar@example.com / password123');
    console.log('Patient 3: nimal.silva@example.com / password123');
    console.log('Patient 4: wimal.fernando@example.com / password123');
    console.log('Patient 5: malini.perera@example.com / password123');
    console.log('Doctor 1: dr.sunil@hospital.com / password123');
    console.log('Doctor 2: dr.amali@hospital.com / password123');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

// Run the seed function
seedData(); 