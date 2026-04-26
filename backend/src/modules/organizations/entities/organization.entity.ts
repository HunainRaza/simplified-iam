import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('organizations')
export class Organization {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @ManyToOne(() => Organization, (org) => org.children, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'parent_id' })
    parent: Organization;

    @Column({ nullable: true })
    parentId: string;

    @OneToMany(() => Organization, (org) => org.parent)
    children: Organization[];

    @ManyToMany(() => User, (user) => user.organizations)
    users: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
