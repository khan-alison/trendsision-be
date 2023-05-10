import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CityEntity } from "./city.entity";

@Entity()
export class CountryEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(() => CityEntity, (city) => city.country)
    cities: CityEntity[];
}
