import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('auth_settings')
export class AuthSettings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    passkeysEnabled: boolean;

    @Column({ default: true })
    passwordEnabled: boolean;

    @Column({ default: false })
    emailPasscodeEnabled: boolean;

    @Column({ default: false })
    mobileNumberEnabled: boolean;

    @Column({ default: false })
    totpEnabled: boolean;

    @Column({ default: false })
    mfaEmailEnabled: boolean;

    @Column({ default: false })
    mfaSmsEnabled: boolean;

    @UpdateDateColumn()
    updatedAt: Date;
}