import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { City } from "./city.entity";

@Entity()
export class Country extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(() => City, (city) => city.country, {
        cascade: true,
        eager: true,
        onDelete: "CASCADE",
    })
    cities: City[];
}
