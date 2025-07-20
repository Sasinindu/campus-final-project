import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export interface IAttachment {
  id?: number;
  fileName: string;
  fileDisplayName: string;
  fileType: string;
  fileSize: number;
  isMediaFile: boolean;
  createdAt: Date;
  signedUrl?: string;
}

@Entity('attachments')
export class Attachment implements IAttachment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ type: 'varchar', length: 255 })
  fileDisplayName!: string;

  @Column({ type: 'varchar', length: 255 })
  fileType!: string;

  @Column('double')
  fileSize!: number;

  @Column({ type: 'boolean', default: false })
  isMediaFile!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  signedUrl?: string;
}
