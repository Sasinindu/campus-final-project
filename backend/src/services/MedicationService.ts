import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Medication } from '../entities/Medication';
import { Patient } from '../entities/Patient';
import { User } from '../entities/User';
import { AppError } from '../utils/errors';

interface MedicationFilters {
  page?: number;
  limit?: number;
  patientId?: number;
  isActive?: boolean;
}

interface MedicationData {
  patient_id: number;
  prescribed_by: number;
  medication_name: string;
  dosage?: string;
  frequency?: string;
  start_date: Date;
  end_date?: Date;
  instructions?: string;
  is_active?: boolean;
}

export class MedicationService {
  private medicationRepository: Repository<Medication>;
  private patientRepository: Repository<Patient>;
  private userRepository: Repository<User>;

  constructor() {
    this.medicationRepository = AppDataSource.getRepository(Medication);
    this.patientRepository = AppDataSource.getRepository(Patient);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async getAllMedications(filters: MedicationFilters = {}) {
    try {
      const { page = 1, limit = 10, patientId, isActive } = filters;
      const skip = (page - 1) * limit;

      const queryBuilder = this.medicationRepository
        .createQueryBuilder('medication')
        .leftJoinAndSelect('medication.patient', 'patient')
        .leftJoinAndSelect('medication.prescribed_by_user', 'prescribed_by_user')
        .orderBy('medication.created_at', 'DESC');

      if (patientId) {
        queryBuilder.andWhere('medication.patient_id = :patientId', { patientId });
      }

      if (isActive !== undefined) {
        queryBuilder.andWhere('medication.is_active = :isActive', { isActive });
      }

      const [medications, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        medications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError('Failed to get medications', 500);
    }
  }

  async getMedicationById(id: number) {
    try {
      const medication = await this.medicationRepository.findOne({
        where: { id },
        relations: ['patient', 'prescribed_by_user'],
      });

      if (!medication) {
        throw new AppError('Medication not found', 404);
      }

      return medication;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get medication', 500);
    }
  }

  async getMedicationsByPatient(patientId: number) {
    try {
      const medications = await this.medicationRepository.find({
        where: { patient_id: patientId },
        relations: ['prescribed_by_user'],
        order: { created_at: 'DESC' },
      });

      return medications;
    } catch (error) {
      throw new AppError('Failed to get patient medications', 500);
    }
  }

  async createMedication(medicationData: MedicationData) {
    try {
      // Validate patient exists
      const patient = await this.patientRepository.findOne({
        where: { id: medicationData.patient_id },
      });

      if (!patient) {
        throw new AppError('Patient not found', 404);
      }

      // Validate doctor exists
      const doctor = await this.userRepository.findOne({
        where: { id: medicationData.prescribed_by },
      });

      if (!doctor) {
        throw new AppError('Doctor not found', 404);
      }

      const medication = this.medicationRepository.create({
        ...medicationData,
        is_active: medicationData.is_active !== undefined ? medicationData.is_active : true,
      });

      const savedMedication = await this.medicationRepository.save(medication);

      return await this.getMedicationById(savedMedication.id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create medication', 500);
    }
  }

  async updateMedication(id: number, updateData: Partial<MedicationData>) {
    try {
      const medication = await this.getMedicationById(id);

      if (updateData.patient_id) {
        const patient = await this.patientRepository.findOne({
          where: { id: updateData.patient_id },
        });
        if (!patient) {
          throw new AppError('Patient not found', 404);
        }
      }

      if (updateData.prescribed_by) {
        const doctor = await this.userRepository.findOne({
          where: { id: updateData.prescribed_by },
        });
        if (!doctor) {
          throw new AppError('Doctor not found', 404);
        }
      }

      await this.medicationRepository.update(id, updateData);

      return await this.getMedicationById(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update medication', 500);
    }
  }

  async deleteMedication(id: number) {
    try {
      const medication = await this.getMedicationById(id);
      await this.medicationRepository.remove(medication);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete medication', 500);
    }
  }

  async updateMedicationStatus(id: number, isActive: boolean) {
    try {
      const medication = await this.getMedicationById(id);
      await this.medicationRepository.update(id, { is_active: isActive });

      return await this.getMedicationById(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update medication status', 500);
    }
  }
} 