import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Patient } from '../entities/Patient';
import { User } from '../entities/User';
import {
  CreatePatientDto,
  UpdatePatientDto,
  PaginationParams,
  PaginatedResponse,
  PatientFilters,
} from '../types';
import {
  AppError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from '../utils/errors';

export class PatientService {
  private patientRepository: Repository<Patient>;
  private userRepository: Repository<User>;

  constructor() {
    this.patientRepository = AppDataSource.getRepository(Patient);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createPatient(patientData: CreatePatientDto): Promise<Patient> {
    try {
      // Check if patient_id already exists
      const existingPatient = await this.patientRepository.findOne({
        where: { patient_id: patientData.patient_id },
      });

      if (existingPatient) {
        throw new ConflictError('Patient ID already exists');
      }

      // Validate primary doctor if provided
      if (patientData.primary_doctor_id) {
        const doctor = await this.userRepository.findOne({
          where: {
            id: patientData.primary_doctor_id,
            userRole: 'doctor',
          },
        });

        if (!doctor) {
          throw new ValidationError('Invalid primary doctor ID');
        }
      }

      // Create patient
      const patient = this.patientRepository.create({
        ...patientData,
        date_of_birth: new Date(patientData.date_of_birth),
      } as any);

      const savedPatient = await this.patientRepository.save(patient);
      return savedPatient as unknown as Patient;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create patient', 500);
    }
  }

  async getPatientById(id: number): Promise<Patient> {
    try {
      const patient = await this.patientRepository.findOne({
        where: { id },
        relations: ['primary_doctor', 'user'],
      });

      if (!patient) {
        throw new NotFoundError('Patient');
      }

      return patient;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get patient', 500);
    }
  }

  async getPatientByPatientId(patientId: string): Promise<Patient> {
    try {
      const patient = await this.patientRepository.findOne({
        where: { patient_id: patientId },
        relations: ['primary_doctor', 'user'],
      });

      if (!patient) {
        throw new NotFoundError('Patient');
      }

      return patient;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get patient', 500);
    }
  }

  async updatePatient(
    id: number,
    updateData: UpdatePatientDto,
  ): Promise<Patient> {
    try {
      const patient = await this.patientRepository.findOne({
        where: { id },
      });

      if (!patient) {
        throw new NotFoundError('Patient');
      }

      // Validate primary doctor if being updated
      if (updateData.primary_doctor_id) {
        const doctor = await this.userRepository.findOne({
          where: {
            id: updateData.primary_doctor_id,
            userRole: 'doctor',
          },
        });

        if (!doctor) {
          throw new ValidationError('Invalid primary doctor ID');
        }
      }

      // Update patient
      await this.patientRepository.update(id, updateData as any);

      const updatedPatient = await this.patientRepository.findOne({
        where: { id },
        relations: ['primary_doctor', 'user'],
      });

      if (!updatedPatient) {
        throw new NotFoundError('Patient');
      }

      return updatedPatient;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update patient', 500);
    }
  }

  async getPatients(
    pagination: PaginationParams = {},
    filters: PatientFilters = {},
  ): Promise<PaginatedResponse<Patient>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC',
      } = pagination;
      const skip = (page - 1) * limit;

      // Build query
      const queryBuilder = this.patientRepository
        .createQueryBuilder('patient')
        .leftJoinAndSelect('patient.primary_doctor', 'doctor')
        .leftJoinAndSelect('patient.user', 'user');

      // Apply filters
      if (filters.region) {
        queryBuilder.andWhere('patient.region = :region', {
          region: filters.region,
        });
      }

      if (filters.doctor_id) {
        queryBuilder.andWhere('patient.primary_doctor_id = :doctorId', {
          doctorId: filters.doctor_id,
        });
      }

      if (filters.is_active !== undefined) {
        queryBuilder.andWhere('patient.is_active = :isActive', {
          isActive: filters.is_active,
        });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(patient.first_name LIKE :search OR patient.last_name LIKE :search OR patient.patient_id LIKE :search)',
          { search: `%${filters.search}%` },
        );
      }

      // Apply sorting
      queryBuilder.orderBy(`patient.${sortBy}`, sortOrder);

      // Apply pagination
      queryBuilder.skip(skip).take(limit);

      // Execute query
      const [patients, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        data: patients,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch {
      throw new AppError('Failed to get patients', 500);
    }
  }

  async deletePatient(id: number): Promise<void> {
    try {
      const patient = await this.patientRepository.findOne({
        where: { id },
      });

      if (!patient) {
        throw new NotFoundError('Patient');
      }

      await this.patientRepository.delete(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete patient', 500);
    }
  }

  async deactivatePatient(id: number): Promise<Patient> {
    try {
      const patient = await this.patientRepository.findOne({
        where: { id },
      });

      if (!patient) {
        throw new NotFoundError('Patient');
      }

      await this.patientRepository.update(id, { is_active: false });

      const updatedPatient = await this.patientRepository.findOne({
        where: { id },
        relations: ['primary_doctor', 'user'],
      });

      if (!updatedPatient) {
        throw new NotFoundError('Patient');
      }

      return updatedPatient;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to deactivate patient', 500);
    }
  }

  async getPatientsByDoctor(doctorId: number): Promise<Patient[]> {
    try {
      const patients = await this.patientRepository.find({
        where: { primary_doctor_id: doctorId, is_active: true },
        relations: ['user'],
      });

      return patients;
    } catch {
      throw new AppError('Failed to get patients by doctor', 500);
    }
  }

  async getPatientStats(): Promise<{
    total: number;
    active: number;
    byRegion: { region: string; count: number }[];
    byGender: { gender: string; count: number }[];
  }> {
    try {
      const total = await this.patientRepository.count();
      const active = await this.patientRepository.count({
        where: { is_active: true },
      });

      const byRegion = await this.patientRepository
        .createQueryBuilder('patient')
        .select('patient.region', 'region')
        .addSelect('COUNT(*)', 'count')
        .where('patient.region IS NOT NULL')
        .groupBy('patient.region')
        .getRawMany();

      const byGender = await this.patientRepository
        .createQueryBuilder('patient')
        .select('patient.gender', 'gender')
        .addSelect('COUNT(*)', 'count')
        .groupBy('patient.gender')
        .getRawMany();

      return {
        total,
        active,
        byRegion: byRegion.map((item) => ({
          region: item.region,
          count: parseInt(item.count),
        })),
        byGender: byGender.map((item) => ({
          gender: item.gender,
          count: parseInt(item.count),
        })),
      };
    } catch {
      throw new AppError('Failed to get patient statistics', 500);
    }
  }
}
