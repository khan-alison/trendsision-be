import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Country } from "./country.entity";
import { Tour } from "./tour.entity";

@Entity()
export class City extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(() => Tour, (tour) => tour.city, {
        eager: true,
        cascade: true,
        onDelete: "CASCADE",
    })
    tours: Tour[];

    @Column({ name: "country_id" })
    countryId: string;

    @ManyToOne(() => Country, (country) => country.cities)
    @JoinColumn({
        name: "country_id",
    })
    country: Country;
}
