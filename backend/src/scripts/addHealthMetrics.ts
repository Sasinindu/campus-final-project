import { AppDataSource } from '../config/database';
import { HealthMetric } from '../entities/HealthMetric';
import { Patient } from '../entities/Patient';
import { User } from '../entities/User';

async function addHealthMetrics() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    const healthMetricRepository = AppDataSource.getRepository(HealthMetric);
    const patientRepository = AppDataSource.getRepository(Patient);
    const userRepository = AppDataSource.getRepository(User);

    // Get existing patients and doctors
    const patients = await patientRepository.find({
      relations: ['user']
    });

    const doctors = await userRepository.find({
      where: { userRole: 'doctor' }
    });

    if (patients.length === 0) {
      console.log('No patients found. Please run addPatients.ts first.');
      return;
    }

    if (doctors.length === 0) {
      console.log('No doctors found. Please run seedData.ts first.');
      return;
    }

    console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);

    // Define health metrics data with realistic values
    const healthMetricsData = [
      // Patient 1 - Anita Kumar (Type 2 Diabetes risk)
      {
        patient_id: patients[0].id,
        metric_type: 'HbA1c',
        hba1c: 7.2,
        recorded_by: doctors[0].id,
        notes: 'Elevated HbA1c indicating poor glycemic control'
      },
      {
        patient_id: patients[0].id,
        metric_type: 'Blood Pressure',
        systolic_pressure: 145,
        diastolic_pressure: 92,
        recorded_by: doctors[0].id,
        notes: 'Hypertension detected'
      },
      {
        patient_id: patients[0].id,
        metric_type: 'BMI',
        bmi: 31.4,
        weight_kg: 85,
        height_cm: 165,
        recorded_by: doctors[0].id,
        notes: 'Obese BMI'
      },

      // Patient 2 - Nimal Silva (Cardiovascular risk)
      {
        patient_id: patients[1].id,
        metric_type: 'Blood Pressure',
        systolic_pressure: 155,
        diastolic_pressure: 95,
        recorded_by: doctors[0].id,
        notes: 'Stage 2 hypertension'
      },
      {
        patient_id: patients[1].id,
        metric_type: 'LDL Cholesterol',
        ldl_cholesterol: 142,
        recorded_by: doctors[0].id,
        notes: 'Elevated LDL cholesterol'
      },
      {
        patient_id: patients[1].id,
        metric_type: 'HDL Cholesterol',
        hdl_cholesterol: 38,
        recorded_by: doctors[0].id,
        notes: 'Low HDL cholesterol'
      },

      // Patient 3 - Wimal Fernando (Liver disease risk)
      {
        patient_id: patients[2].id,
        metric_type: 'BMI',
        bmi: 33.1,
        weight_kg: 95,
        height_cm: 170,
        recorded_by: doctors[0].id,
        notes: 'Severe obesity'
      },
      {
        patient_id: patients[2].id,
        metric_type: 'Triglycerides',
        triglycerides: 280,
        recorded_by: doctors[0].id,
        notes: 'High triglyceride levels'
      },
      {
        patient_id: patients[2].id,
        metric_type: 'HbA1c',
        hba1c: 6.8,
        recorded_by: doctors[0].id,
        notes: 'Pre-diabetic HbA1c'
      },

      // Patient 4 - Malini Perera (Low risk)
      {
        patient_id: patients[3].id,
        metric_type: 'HbA1c',
        hba1c: 6.3,
        recorded_by: doctors[0].id,
        notes: 'Pre-diabetic but well controlled'
      },
      {
        patient_id: patients[3].id,
        metric_type: 'BMI',
        bmi: 24.1,
        weight_kg: 65,
        height_cm: 164,
        recorded_by: doctors[0].id,
        notes: 'Healthy BMI'
      },
      {
        patient_id: patients[3].id,
        metric_type: 'Blood Pressure',
        systolic_pressure: 118,
        diastolic_pressure: 78,
        recorded_by: doctors[0].id,
        notes: 'Normal blood pressure'
      },

      // Additional patients for better distribution
      // Patient 5
      {
        patient_id: patients[4]?.id || patients[0].id,
        metric_type: 'LDL Cholesterol',
        ldl_cholesterol: 95,
        recorded_by: doctors[0].id,
        notes: 'Normal LDL levels'
      },
      {
        patient_id: patients[4]?.id || patients[0].id,
        metric_type: 'HDL Cholesterol',
        hdl_cholesterol: 52,
        recorded_by: doctors[0].id,
        notes: 'Good HDL levels'
      },

      // Patient 6
      {
        patient_id: patients[5]?.id || patients[1].id,
        metric_type: 'Triglycerides',
        triglycerides: 120,
        recorded_by: doctors[0].id,
        notes: 'Normal triglyceride levels'
      },
      {
        patient_id: patients[5]?.id || patients[1].id,
        metric_type: 'Blood Pressure',
        systolic_pressure: 125,
        diastolic_pressure: 82,
        recorded_by: doctors[0].id,
        notes: 'Pre-hypertensive'
      }
    ];

    // Add health metrics
    for (const metricData of healthMetricsData) {
      try {
        const existingMetric = await healthMetricRepository.findOne({
          where: {
            patient_id: metricData.patient_id,
            metric_type: metricData.metric_type
          }
        });

        if (!existingMetric) {
          const healthMetric = healthMetricRepository.create(metricData);
          await healthMetricRepository.save(healthMetric);
          console.log(`✅ Added health metric for patient ${metricData.patient_id}: ${metricData.metric_type}`);
        } else {
          console.log(`⏭️  Health metric already exists for patient ${metricData.patient_id}: ${metricData.metric_type}`);
        }
      } catch (error) {
        console.error(`❌ Error adding health metric for patient ${metricData.patient_id}:`, (error as Error).message);
      }
    }

    console.log('\n🎉 Health metrics added successfully!');
    console.log('\n📊 Summary:');
    console.log('- HbA1c: Various levels (normal to elevated)');
    console.log('- Blood Pressure: Range from normal to hypertensive');
    console.log('- LDL Cholesterol: Normal to elevated levels');
    console.log('- HDL Cholesterol: Low to good levels');
    console.log('- Triglycerides: Normal to high levels');
    console.log('- BMI: Healthy to obese ranges');

  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
}

addHealthMetrics(); 