import { AppDataSource } from '../config/database';
import { Medication } from '../entities/Medication';
import { Patient, Gender, BloodType } from '../entities/Patient';
import { User } from '../entities/User';
import { AIPrediction, RiskLevel } from '../entities/AIPrediction';
import { HealthMetric } from '../entities/HealthMetric';
import * as bcrypt from 'bcryptjs';

async function addPatients() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    // Get repositories
    const medicationRepository = AppDataSource.getRepository(Medication);
    const patientRepository = AppDataSource.getRepository(Patient);
    const userRepository = AppDataSource.getRepository(User);
    const aiPredictionRepository = AppDataSource.getRepository(AIPrediction);
    const healthMetricRepository = AppDataSource.getRepository(HealthMetric);

    // Check if we already have patients
    const existingPatients = await patientRepository.count();
    if (existingPatients > 0) {
      console.log(`Found ${existingPatients} existing patients. Adding additional patients...`);
    }

    // Get existing doctors
    const doctors = await userRepository.find({ where: { userRole: 'doctor' } });
    if (doctors.length === 0) {
      console.log('No doctors found. Please run the main seed script first.');
      return;
    }

    const doctor1 = doctors[0];
    const doctor2 = doctors[1] || doctor1;

    // Create additional patient users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const newPatientUsers = [
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
      }
    ];

    // Create new patient users (skip if they already exist)
    const createdPatientUsers: User[] = [];
    for (const userData of newPatientUsers) {
      try {
        const existingUser = await userRepository.findOne({ where: { name: userData.name } });
        if (existingUser) {
          console.log(`User ${userData.name} already exists, skipping...`);
          createdPatientUsers.push(existingUser);
        } else {
          const user = userRepository.create(userData);
          const savedUser = await userRepository.save(user);
          createdPatientUsers.push(savedUser);
          console.log(`Created user: ${userData.first_name} ${userData.last_name}`);
        }
             } catch (error) {
         console.log(`Error creating user ${userData.name}:`, (error as Error).message);
       }
    }

    // Create additional patients
    const additionalPatientsData = [
      {
        patient_id: 'P-002',
        user_id: createdPatientUsers[0].id,
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
        user_id: createdPatientUsers[1].id,
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
        primary_doctor_id: doctor2.id,
        insurance_number: 'INS003',
        is_active: true
      },
      {
        patient_id: 'P-004',
        user_id: createdPatientUsers[2].id,
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
        primary_doctor_id: doctor2.id,
        insurance_number: 'INS004',
        is_active: true
      },
      {
        patient_id: 'P-005',
        user_id: createdPatientUsers[3].id,
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
    for (const patientData of additionalPatientsData) {
      try {
        const existingPatient = await patientRepository.findOne({ where: { patient_id: patientData.patient_id } });
        if (existingPatient) {
          console.log(`Patient ${patientData.patient_id} already exists, skipping...`);
          createdPatients.push(existingPatient);
        } else {
          const patient = patientRepository.create(patientData);
          const savedPatient = await patientRepository.save(patient);
          createdPatients.push(savedPatient);
          console.log(`Created patient: ${patientData.first_name} ${patientData.last_name}`);
        }
             } catch (error) {
         console.log(`Error creating patient ${patientData.patient_id}:`, (error as Error).message);
       }
    }

    // Create sample medications for new patients
    const medications = [
      {
        patient_id: createdPatients[0].id,
        prescribed_by: doctor1.id,
        medication_name: 'Insulin Glargine',
        dosage: '10 units',
        frequency: 'Once daily at bedtime',
        start_date: new Date('2024-03-01'),
        instructions: 'Inject subcutaneously in the evening',
        is_active: true
      },
      {
        patient_id: createdPatients[1].id,
        prescribed_by: doctor2.id,
        medication_name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily in the morning',
        start_date: new Date('2024-01-20'),
        instructions: 'Take on empty stomach',
        is_active: true
      },
      {
        patient_id: createdPatients[2].id,
        prescribed_by: doctor2.id,
        medication_name: 'Omeprazole',
        dosage: '20mg',
        frequency: 'Once daily before breakfast',
        start_date: new Date('2024-02-15'),
        instructions: 'Take 30 minutes before meals',
        is_active: true
      },
      {
        patient_id: createdPatients[3].id,
        prescribed_by: doctor1.id,
        medication_name: 'Calcium Carbonate',
        dosage: '500mg',
        frequency: 'Twice daily with meals',
        start_date: new Date('2024-01-10'),
        instructions: 'Take with food for better absorption',
        is_active: true
      }
    ];

    // Create sample AI predictions for new patients
    const aiPredictions = [
      {
        patient_id: createdPatients[0].id,
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
        patient_id: createdPatients[1].id,
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
        patient_id: createdPatients[2].id,
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
        patient_id: createdPatients[3].id,
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

    // Create sample health metrics for new patients
    const healthMetrics = [
      {
        patient_id: createdPatients[0].id,
        metric_type: 'blood_glucose',
        value: 280,
        unit: 'mg/dL',
        recorded_at: new Date('2024-03-14T09:00:00'),
        notes: 'Random blood glucose - elevated'
      },
      {
        patient_id: createdPatients[1].id,
        metric_type: 'blood_pressure',
        value: 145,
        unit: 'mmHg',
        recorded_at: new Date('2024-03-13T10:00:00'),
        notes: 'Systolic blood pressure - elevated'
      },
      {
        patient_id: createdPatients[2].id,
        metric_type: 'weight',
        value: 72,
        unit: 'kg',
        recorded_at: new Date('2024-03-12T11:00:00'),
        notes: 'Current weight'
      },
      {
        patient_id: createdPatients[3].id,
        metric_type: 'bone_density',
        value: -2.1,
        unit: 'T-score',
        recorded_at: new Date('2024-03-11T14:00:00'),
        notes: 'DXA scan result - osteopenia'
      }
    ];

    // Insert medications
    for (const medicationData of medications) {
      try {
        const medication = medicationRepository.create(medicationData);
        await medicationRepository.save(medication);
        console.log(`Created medication: ${medicationData.medication_name}`);
             } catch (error) {
         console.log(`Error creating medication: ${(error as Error).message}`);
       }
    }

    // Insert AI predictions
    for (const predictionData of aiPredictions) {
      try {
        const prediction = aiPredictionRepository.create(predictionData);
        await aiPredictionRepository.save(prediction);
        console.log(`Created AI prediction: ${predictionData.prediction_type}`);
             } catch (error) {
         console.log(`Error creating AI prediction: ${(error as Error).message}`);
       }
    }

    // Insert health metrics
    for (const metricData of healthMetrics) {
      try {
        const metric = healthMetricRepository.create(metricData);
        await healthMetricRepository.save(metric);
        console.log(`Created health metric: ${metricData.metric_type}`);
             } catch (error) {
         console.log(`Error creating health metric: ${(error as Error).message}`);
       }
    }

    console.log('Additional patients and data added successfully!');
    console.log('New patient credentials:');
    console.log('Patient 2: anita.kumar@example.com / password123');
    console.log('Patient 3: nimal.silva@example.com / password123');
    console.log('Patient 4: wimal.fernando@example.com / password123');
    console.log('Patient 5: malini.perera@example.com / password123');
  } catch (error) {
    console.error('Error adding patients:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

// Run the function
addPatients(); 