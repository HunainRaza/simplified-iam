import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { Organization } from 'src/modules/organizations/entities/organization.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isSystemAdmin: boolean;

    @Column({ default: false })
    isGlobalUserAdmin: boolean;

    @Column({ default: false })
    isGlobal3rdLevelUser: boolean;

    @ManyToMany(() => Organization, (org) => org.users, { cascade: true })
    @JoinTable({
        name: 'user_organizations',
        joinColumn: { name: 'user_id' },
        inverseJoinColumn: { name: 'organization_id' },
    })
    organizations: Organization[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
