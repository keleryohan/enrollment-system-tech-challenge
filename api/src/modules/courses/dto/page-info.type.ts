import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PageInfoType {
  @Field()
  hasNextPage!: boolean;

  @Field({ nullable: true })
  endCursor?: string; // cursor to the last item in the current page
}
