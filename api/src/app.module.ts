import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { PingModule } from './modules/ping/ping.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataLoaderModule } from './loaders/dataloader.module';
import { DataLoaderFactory } from './loaders/dataloader.factory';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // obs: should change to migrations if in prod
      logging: ['error', 'warn'],
    }),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
			driver: ApolloDriver,
			imports: [DataLoaderModule],
			inject: [DataLoaderFactory],
			useFactory: (factory: DataLoaderFactory) => ({
				playground: true,
				sortSchema: true,
				autoSchemaFile: join(process.cwd(), 'schema.graphql'),
				path: '/graphql',
				context: ({ req }) => {
					const tenantId = req.header('x-tenant-id');
					return {
						req,
						tenantId,
						loaders: tenantId ? factory.create(tenantId) : null,
					};
				},
			}),
		}),
    PingModule,
    TenantsModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    EnrollmentsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
