import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@Entity()
export class WazeJams {
  @PrimaryColumn({
    type: "bigint",
    unsigned: true
  })
  public uuid!: number;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;

  @Column({
    type: "uuid",
    nullable: true
  })
  public blockingAlertUuid: string | null = null;

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
}
