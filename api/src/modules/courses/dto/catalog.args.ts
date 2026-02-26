import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class CatalogArgs {
  @Field(() => Int)
  first!: number; // number of items to return

  @Field({ nullable: true })
  after?: string; // cursor to start the page (get items after this)
}