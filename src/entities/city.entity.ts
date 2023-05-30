import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
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

    @ManyToMany(() => Tour)
    tours: Tour[];

    @Column({ name: "country_id" })
    countryId: string;

    @ManyToOne(() => Country, (country) => country.cities)
    @JoinColumn({
        name: "country_id",
    })
    country: Country;
}
