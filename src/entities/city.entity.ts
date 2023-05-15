import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { CountryEntity } from "./country.entity";
import { TourEntity } from "./tour.entity";

@Entity()
export class CityEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(() => TourEntity, (tour) => tour.city)
    tours: TourEntity[];

    @ManyToOne(() => CountryEntity, (country) => country.cities, {
        cascade: true,
        eager: true,
    })
    country: CountryEntity;
}
