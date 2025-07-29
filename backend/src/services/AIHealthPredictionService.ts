import axios from 'axios';
import { CustomException } from '../exception/CustomException';
import { Patient } from '../entities/Patient';
import { HealthMetric } from '../entities/HealthMetric';
import { AIPrediction, RiskLevel } from '../entities/AIPrediction';
import { Repository, MoreThanOrEqual } from 'typeorm';

interface AIHealthData {
  age: number;
  gender: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
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
  symptoms?: string[];
  recent_metrics: {
    type: string;
    value: string;
    date: string;
  }[];
}

interface AIResponse {
  risk_level: 'low' | 'moderate' | 'high';
  predicted_conditions: string[];
  recommendations: string[];
  confidence_score: number;
  next_checkup_date: string;
  lifestyle_changes: string[];
  medication_suggestions: string[];
}

export class AIHealthPredictionService {
  private readonly openaiApiKey: string;
  private readonly openaiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(
    private patientRepository: Repository<Patient>,
    private healthMetricRepository: Repository<HealthMetric>,
    private aiPredictionRepository: Repository<AIPrediction>
  ) {
    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      console.error('Please add OPENAI_API_KEY to your .env.development, .env.production, or .env.qa file');
      throw new Error('OPENAI_API_KEY environment variable is required for AI health predictions');
    }
    
    if (apiKey.length < 20) {
      console.error('OPENAI_API_KEY appears to be invalid (too short)');
      throw new Error('Invalid OPENAI_API_KEY format');
    }
    
    this.openaiApiKey = apiKey;
    console.log('AIHealthPredictionService initialized with OpenAI API key');
  }

  async generateHealthPrediction(patientId: number): Promise<AIPrediction> {
    try {
      // Get patient details
      const patient = await this.patientRepository.findOne({
        where: { id: patientId },
        relations: ['user']
      });

      if (!patient) {
        throw new CustomException('Patient not found', 0, 404);
      }

      // Get recent health metrics (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      console.log('Fetching metrics from:', thirtyDaysAgo);

      const recentMetrics = await this.healthMetricRepository.find({
        where: {
          patient_id: patientId,
          created_at: MoreThanOrEqual(thirtyDaysAgo)
        },
        order: { created_at: 'DESC' },
        take: 50 // Get last 50 metrics
      });

      console.log('Found metrics:', recentMetrics.length);

      // Prepare data for AI
      const healthData = this.prepareHealthData(patient, recentMetrics);

      // Call OpenAI API
      const aiResponse = await this.callOpenAI(healthData);

      // Save prediction to database
      const prediction = this.aiPredictionRepository.create({
        patient_id: patientId,
        prediction_type: 'health_risk_assessment',
        risk_level: this.mapRiskLevel(aiResponse.risk_level),
        risk_percentage: aiResponse.confidence_score * 100,
        confidence_score: aiResponse.confidence_score,
        factors: aiResponse.predicted_conditions,
        explanation: `AI analysis based on patient health data. Risk level: ${aiResponse.risk_level}`,
        recommendations: aiResponse.recommendations,
        is_alert: aiResponse.risk_level === 'high',
        is_reviewed: false
      });

      return await this.aiPredictionRepository.save(prediction);

    } catch (error) {
      console.error('Error generating health prediction:', error);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException('Failed to generate health prediction', 0, 500);
    }
  }

  private prepareHealthData(patient: Patient, metrics: HealthMetric[]): AIHealthData {
    // Calculate age
    console.log('Patient data:', {
      id: patient.id,
      date_of_birth: patient.date_of_birth,
      date_of_birth_type: typeof patient.date_of_birth,
      gender: patient.gender
    });
    
    const age = this.calculateAge(patient.date_of_birth);
    console.log('Calculated age:', age);

    // Extract latest values for each metric type
    const latestMetrics = new Map<string, HealthMetric>();
    metrics.forEach(metric => {
      if (!latestMetrics.has(metric.metric_type)) {
        latestMetrics.set(metric.metric_type, metric);
      }
    });

    // Prepare recent metrics for AI
    const recentMetricsData = metrics.slice(0, 10).map(metric => ({
      type: metric.metric_type,
      value: this.getMetricValue(metric),
      date: metric.created_at.toISOString().split('T')[0]
    }));

    const healthData = {
      age,
      gender: patient.gender,
      blood_pressure_systolic: latestMetrics.get('blood_pressure')?.systolic_pressure,
      blood_pressure_diastolic: latestMetrics.get('blood_pressure')?.diastolic_pressure,
      blood_sugar_fasting: latestMetrics.get('blood_sugar')?.blood_sugar_fasting,
      blood_sugar_random: latestMetrics.get('blood_sugar')?.blood_sugar_random,
      hba1c: latestMetrics.get('blood_sugar')?.hba1c,
      total_cholesterol: latestMetrics.get('cholesterol')?.total_cholesterol,
      hdl_cholesterol: latestMetrics.get('cholesterol')?.hdl_cholesterol,
      ldl_cholesterol: latestMetrics.get('cholesterol')?.ldl_cholesterol,
      triglycerides: latestMetrics.get('cholesterol')?.triglycerides,
      bmi: latestMetrics.get('anthropometric')?.bmi,
      weight_kg: latestMetrics.get('anthropometric')?.weight_kg,
      height_cm: latestMetrics.get('anthropometric')?.height_cm,
      temperature_celsius: latestMetrics.get('vital_signs')?.temperature_celsius,
      heart_rate: latestMetrics.get('vital_signs')?.heart_rate,
      oxygen_saturation: latestMetrics.get('vital_signs')?.oxygen_saturation,
      alt_enzyme: latestMetrics.get('liver_function')?.alt_enzyme,
      ast_enzyme: latestMetrics.get('liver_function')?.ast_enzyme,
      creatinine: latestMetrics.get('kidney_function')?.creatinine,
      egfr: latestMetrics.get('kidney_function')?.egfr,
      symptoms: this.extractSymptoms(metrics),
      recent_metrics: recentMetricsData
    };

    console.log('Prepared health data:', healthData);
    return healthData;
  }

  private async callOpenAI(healthData: AIHealthData): Promise<AIResponse> {
    const systemPrompt = `You are a medical AI assistant that analyzes patient health data and returns a structured JSON prediction for chronic disease risk. 
    
    Analyze the provided health data and return ONLY a JSON response with the following structure (no markdown, no explanation, just the JSON):
    {
      "risk_level": "low|moderate|high",
      "predicted_conditions": ["condition1", "condition2"],
      "recommendations": ["recommendation1", "recommendation2"],
      "confidence_score": 0.85,
      "next_checkup_date": "2024-02-15",
      "lifestyle_changes": ["change1", "change2"],
      "medication_suggestions": ["medication1", "medication2"]
    }
    
    Consider factors like age, gender, blood pressure, cholesterol, blood sugar, BMI, and recent health trends.`;

    const userPrompt = `Analyze this patient's health data and provide a comprehensive risk assessment. Return ONLY the JSON response:
    ${JSON.stringify(healthData, null, 2)}`;

    try {
      const response = await axios.post(this.openaiUrl, {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0,
        max_tokens: 512,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      console.log('Raw AI response:', aiResponse);
      
      // Extract JSON from the response (handle markdown formatting)
      let jsonString = aiResponse.trim();
      
      // Remove markdown code blocks if present
      if (jsonString.includes('```json')) {
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonString.includes('```')) {
        jsonString = jsonString.replace(/```\n?/g, '');
      }
      
      // Remove any text before the first { and after the last }
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }
      
      console.log('Extracted JSON string:', jsonString);
      
      // Parse JSON response
      try {
        const parsedResponse = JSON.parse(jsonString);
        console.log('Parsed response:', parsedResponse);
        return parsedResponse as AIResponse;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.error('JSON string that failed to parse:', jsonString);
        throw new CustomException('Invalid AI response format', 0, 500);
      }

    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new CustomException('Failed to get AI prediction', 0, 500);
    }
  }

  private calculateAge(birthDate: Date | string): number {
    try {
      // Ensure birthDate is a Date object
      const birthDateObj = birthDate instanceof Date ? birthDate : new Date(birthDate);
      
      // Check if the date is valid
      if (isNaN(birthDateObj.getTime())) {
        console.error('Invalid birth date:', birthDate);
        return 0; // Return 0 as fallback
      }
      
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Error calculating age:', error, 'birthDate:', birthDate);
      return 0; // Return 0 as fallback
    }
  }

  private getMetricValue(metric: HealthMetric): string {
    switch (metric.metric_type) {
      case 'blood_pressure':
        return `${metric.systolic_pressure}/${metric.diastolic_pressure} mmHg`;
      case 'blood_sugar':
        return `${metric.blood_sugar_fasting || metric.blood_sugar_random} mg/dL`;
      case 'cholesterol':
        return `Total: ${metric.total_cholesterol}, HDL: ${metric.hdl_cholesterol}`;
      case 'vital_signs':
        return `Temp: ${metric.temperature_celsius}°C, HR: ${metric.heart_rate} bpm`;
      case 'liver_function':
        return `ALT: ${metric.alt_enzyme}, AST: ${metric.ast_enzyme}`;
      case 'kidney_function':
        return `Creatinine: ${metric.creatinine}, eGFR: ${metric.egfr}`;
      case 'anthropometric':
        return `Weight: ${metric.weight_kg}kg, BMI: ${metric.bmi}`;
      default:
        return 'N/A';
    }
  }

  private extractSymptoms(metrics: HealthMetric[]): string[] {
    const symptoms: string[] = [];
    
    // Analyze metrics for potential symptoms
    metrics.forEach(metric => {
      if (metric.notes) {
        const note = metric.notes.toLowerCase();
        if (note.includes('fatigue') || note.includes('tired')) symptoms.push('fatigue');
        if (note.includes('frequent urination') || note.includes('polyuria')) symptoms.push('frequent urination');
        if (note.includes('thirst') || note.includes('polydipsia')) symptoms.push('excessive thirst');
        if (note.includes('weight loss')) symptoms.push('unexplained weight loss');
        if (note.includes('blurred vision')) symptoms.push('blurred vision');
        if (note.includes('numbness') || note.includes('tingling')) symptoms.push('numbness/tingling');
        if (note.includes('chest pain')) symptoms.push('chest pain');
        if (note.includes('shortness of breath')) symptoms.push('shortness of breath');
      }
    });

    return [...new Set(symptoms)]; // Remove duplicates
  }

  private mapRiskLevel(aiRiskLevel: string): RiskLevel {
    switch (aiRiskLevel.toLowerCase()) {
      case 'high':
        return RiskLevel.HIGH;
      case 'moderate':
        return RiskLevel.MODERATE;
      case 'low':
      default:
        return RiskLevel.LOW;
    }
  }

  async getPatientPredictions(patientId: number): Promise<AIPrediction[]> {
    return await this.aiPredictionRepository.find({
      where: { patient_id: patientId },
      order: { created_at: 'DESC' }
    });
  }

  async updatePrediction(predictionId: number, updates: Partial<AIPrediction>): Promise<AIPrediction> {
    const prediction = await this.aiPredictionRepository.findOne({
      where: { id: predictionId }
    });

    if (!prediction) {
      throw new CustomException('Prediction not found', 0, 404);
    }

    Object.assign(prediction, updates);
    return await this.aiPredictionRepository.save(prediction);
  }
} 