import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Country } from "./country.entity";
import { Tour } from "./tour.entity";

@Entity()
export class City {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(() => Tour, (tour) => tour.city)
    tours: Tour[];

    @ManyToOne(() => Country, (country) => country.cities, {
        cascade: true,
        eager: true,
    })
    country: Country;
}
