import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'items' })
@ObjectType()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Item Id' })
  id: string;
  @Column()
  @Field(() => String, { description: 'Item name' })
  name: string;
  @Column()
  @Field(() => Float, { description: 'Item quantity' })
  quantity: number;
  @Column({ nullable: true })
  @Field(() => String, { description: 'Item quantityUnits', nullable: true })
  quantityUnits?: string;
}
