import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from "typeorm";
import { Post } from "./Post";

@Entity()
@Index(["slug"], { unique: true })
export class Blog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @OneToMany(() => Post, (post) => post.blog, { cascade: true })
  posts!: Post[];
}
