import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@Entity()
export class WazeAlerts {
  @PrimaryColumn({
    type: "uuid"
  })
  public uuid!: number;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;

  @Column({
    length: 100,
    nullable: true
  })
  public city!: string;

  @Column({
    length: 100,
    nullable: true
  })
  public street!: string;

  // make enums?
  @Column({
    length: 100
  })
  public type!: string;

  @Column({
    length: 100
  })
  public subtype!: string;

  @Column({
    type: "geography",
    spatialFeatureType: "point"
    // spatial: true
    // srid: 3857 or 4326 ???
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public location!: any;

  @Column({
    type: "int"
  })
  public reliability!: number;
}
