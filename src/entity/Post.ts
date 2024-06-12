import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Blog } from "./Blog";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  title?: string;

  @Column()
  content!: string;

  @Column({ default: 0 })
  viewCount!: number;

  @ManyToOne(() => Blog, (blog) => blog.posts)
  blog!: Blog;
}
