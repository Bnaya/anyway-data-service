import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

// alerts: []
// alertsCount: 0
// city: "Bethlehem - بيت لحم"
// country: "WE"
// delaySeconds: 562
// detectionDate: "Wed Aug 14 08:55:01 +0000 2019"
// detectionDateMillis: 1565772901099
// driversCount: 13
// highway: false
// id: 25500041
// jamLevel: 4
// length: 521
// line: [{x: 35.203505, y: 31.71941}, {x: 35.203919, y: 31.719941}, {x: 35.20404, y: 31.720128},…]
// nComments: 0
// nImages: 0
// nThumbsUp: 0
// regularSpeed: 7.31
// seconds: 620
// severity: 5
// speed: 3.02
// street: "الكاريتاس"
// trend: -1
// type: "Small"
// updateDate: "Wed Aug 14 09:01:54 +0000 2019"
// updateDateMillis: 1565773314840

@Entity()
export class WazeIrregularities {
  @PrimaryColumn({
    type: "bigint",
    unsigned: true
  })
  public id!: number;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;

  @Column({
    type: "date",
    nullable: false
  })
  public detectionDate!: Date;
  // ???
  // alerts: []

  @Column({
    type: "integer",
    unsigned: true
  })
  public alertsCount!: number;

  @Column({
    type: "integer",
    unsigned: true
  })
  public driversCount!: number;

  @Column({
    type: "integer",
    unsigned: true
  })
  public delaySeconds!: number;

  @Column({
    type: "integer",
    unsigned: true
  })
  public jamLevel!: number;

  @Column({
    type: "integer",
    unsigned: true
  })
  public length!: number;

  @Column({
    type: "geography"
  })
  public line!: any;

  @Column({
    type: "integer",
    unsigned: true
  })
  public nThumbsUp!: number;

  @Column({
    type: "float"
  })
  public regularSpeed!: number;

  @Column({
    type: "integer",
    unsigned: true
  })
  public seconds!: number;

  @Column({
    type: "integer",
    unsigned: true
  })
  public severity!: number;

  @Column({
    type: "float"
  })
  public speed!: number;

  @Column({
    length: 512
  })
  public street!: string;

  @Column({
    type: "integer",
    unsigned: false
  })
  public trend!: number;

  @Column({
    length: 512
  })
  public type!: string;

  // taken from the data itself.
  @Column({
    type: "date"
  })
  public updateDate!: Date;
}
