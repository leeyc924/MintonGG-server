import { AfterLoad, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ length: 8 })
  name!: string;
  @Column({ length: 4 })
  age!: string;
  @Column({ length: 2 })
  gender!: string;
  @Column({ length: 8 })
  address!: string;
  @Column('date')
  joinDt!: string;
  @CreateDateColumn({ nullable: true })
  regDt!: Date;
  @UpdateDateColumn({ nullable: true })
  modDt!: Date;
  @Column('int4', { default: 2 })
  position!: number;

  fullName!: string;
  @AfterLoad()
  setFullName() {
    this.fullName = `${this.name}/${this.age.slice(2, 4)}/${this.address}/${this.gender === 'F' ? '여' : '남'}`;
  }
}
