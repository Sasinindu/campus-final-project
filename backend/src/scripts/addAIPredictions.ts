import { AppDataSource } from '../config/database';
import { AIPrediction, RiskLevel } from '../entities/AIPrediction';
import { Patient } from '../entities/Patient';
import { User } from '../entities/User';

async function addAIPredictions() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    const aiPredictionRepository = AppDataSource.getRepository(AIPrediction);
    const patientRepository = AppDataSource.getRepository(Patient);
    const userRepository = AppDataSource.getRepository(User);

    // Get existing patients
    const patients = await patientRepository.find({
      relations: ['user']
    });

    if (patients.length === 0) {
      console.log('No patients found. Please run addPatients.ts first.');
      return;
    }

    console.log(`Found ${patients.length} patients`);

    // Define AI predictions data
    const aiPredictionsData = [
      {
        patient_id: patients[0].id, // Anita Kumar
        prediction_type: 'Type 2 Diabetes',
        risk_level: RiskLevel.HIGH,
        risk_percentage: 85.5,
        confidence_score: 92.3,
        factors: [
          'Elevated HbA1c (7.2%)',
          'Family history of diabetes',
          'BMI of 31.4 (Obese)',
          'Sedentary lifestyle'
        ],
        explanation: 'Multiple risk factors indicate high probability of Type 2 Diabetes development within 2-3 years.',
        recommendations: [
          'Immediate lifestyle modification',
          'Regular blood glucose monitoring',
          'Consultation with endocrinologist',
          'Dietary intervention program'
        ],
        is_alert: true,
        is_reviewed: false
      },
      {
        patient_id: patients[1].id, // Nimal Silva
        prediction_type: 'Coronary Heart Disease',
        risk_level: RiskLevel.MODERATE,
        risk_percentage: 65.2,
        confidence_score: 78.9,
        factors: [
          'Hypertension (145/92 mmHg)',
          'Elevated LDL (142 mg/dl)',
          'Smoking history',
          'Age risk factor (58)'
        ],
        explanation: 'Moderate risk of coronary heart disease based on cardiovascular risk factors.',
        recommendations: [
          'Blood pressure management',
          'Cholesterol-lowering medication',
          'Smoking cessation program',
          'Regular cardiac screening'
        ],
        is_alert: true,
        is_reviewed: false
      },
      {
        patient_id: patients[2].id, // Wimal Fernando
        prediction_type: 'Fatty Liver Disease',
        risk_level: RiskLevel.HIGH,
        risk_percentage: 78.4,
        confidence_score: 85.7,
        factors: [
          'Elevated liver enzymes (ALT 72 U/L)',
          'Obesity (BMI 33.1)',
          'Hyperglycemia',
          'Mild hepatomegaly on ultrasound'
        ],
        explanation: 'High risk of non-alcoholic fatty liver disease progression.',
        recommendations: [
          'Weight reduction program',
          'Liver function monitoring',
          'Diabetes management',
          'Regular ultrasound follow-up'
        ],
        is_alert: true,
        is_reviewed: false
      },
      {
        patient_id: patients[3].id, // Malini Perera
        prediction_type: 'Type 2 Diabetes',
        risk_level: RiskLevel.LOW,
        risk_percentage: 35.8,
        confidence_score: 72.1,
        factors: [
          'Pre-diabetic HbA1c (6.3%)',
          'Family history of diabetes',
          'Healthy weight (BMI 24.1)',
          'Regular exercise reported'
        ],
        explanation: 'Low risk due to good lifestyle factors despite family history.',
        recommendations: [
          'Continued lifestyle maintenance',
          'Annual HbA1c monitoring',
          'Preventive dietary counseling',
          'Regular exercise program'
        ],
        is_alert: false,
        is_reviewed: false
      }
    ];

    // Add AI predictions
    for (const predictionData of aiPredictionsData) {
      try {
        const existingPrediction = await aiPredictionRepository.findOne({
          where: {
            patient_id: predictionData.patient_id,
            prediction_type: predictionData.prediction_type
          }
        });

        if (!existingPrediction) {
          const aiPrediction = aiPredictionRepository.create(predictionData);
          await aiPredictionRepository.save(aiPrediction);
          console.log(`✅ Added AI prediction for patient ${predictionData.patient_id}: ${predictionData.prediction_type}`);
        } else {
          console.log(`⏭️  AI prediction already exists for patient ${predictionData.patient_id}: ${predictionData.prediction_type}`);
        }
      } catch (error) {
        console.error(`❌ Error adding AI prediction for patient ${predictionData.patient_id}:`, (error as Error).message);
      }
    }

    console.log('\n🎉 AI predictions added successfully!');
    console.log('\n📊 Summary:');
    console.log('- Type 2 Diabetes (High Risk): Anita Kumar');
    console.log('- Coronary Heart Disease (Moderate Risk): Nimal Silva');
    console.log('- Fatty Liver Disease (High Risk): Wimal Fernando');
    console.log('- Type 2 Diabetes (Low Risk): Malini Perera');

  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
}

addAIPredictions(); 