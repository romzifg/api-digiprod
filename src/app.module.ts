import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilModule } from './utils/util.module';
import { ClientModule } from './clients/client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import configLoader from './config/environment.config';
import * as path from 'path';
import { ThrottlerModule } from '@nestjs/throttler';
import { RepositoryModule } from './repositories/repository.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoryModule } from './modules/category/category.module';
import { TypeModule } from './modules/type/type.module';
import { JobModule } from './modules/job/job.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ProductVoucherModule } from './modules/product-voucher/product-voucher.module';
import { UserProductModule } from './modules/user-product/user-product.module';
import { UserActivityModule } from './modules/user-activity/user-activity.module';

@Module({
  imports: [
    // ConfigModule HARUS di-load PERTAMA dengan loader function
    ConfigModule.forRoot({
      load: [configLoader], // Load config dari AWS/file
      isGlobal: true, // Biar bisa dipakai di semua module tanpa re-import
      cache: true, // Cache config untuk performa
    }),

    // Throttler Module
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ttl = configService.get<number>('timeout', 10000);
        const limit = configService.get<number>('rate_limit_max', 10);

        return [{
          ttl,
          limit,
        }];
      }
    }),

    // TypeORM Module
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbDialect = configService.get<string>('db_dialect');
        const dbHost = configService.get<string>('db_host');
        const dbPort = configService.get<number>('db_port');
        const dbUsername = configService.get<string>('db_username');
        const dbPassword = configService.get<string>('db_password');
        const dbName = configService.get<string>('db_name');
        const dbConnectionTimeout = configService.get<number>('db_connection_timeout', 30000);
        const dbAcquireTimeout = configService.get<number>('db_acquire_timeout', 30000);
        const dbPoolSize = configService.get<number>('db_pool_size', 10);

        // Validation
        if (!dbDialect) {
          throw new Error(
            'Database configuration error: db_dialect is missing. ' +
            'Please check your config.json or AWS Parameter Store.'
          );
        }

        if (!dbHost || !dbPort || !dbUsername || !dbPassword || !dbName) {
          throw new Error(
            'Database configuration error: Missing required fields. ' +
            'Required: db_host, db_port, db_username, db_password, db_name'
          );
        }

        return {
          type: dbDialect as 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbName,
          entities: [path.join(__dirname, 'entities/*.entity{.ts,.js}')],
          ssl: { rejectUnauthorized: false },
          synchronize: true, // ⚠️ SET FALSE DI PRODUCTION!
          migrationsRun: true,
          extra: {
            connectionTimeoutMillis: dbConnectionTimeout,
            query_timeout: dbAcquireTimeout,
            max: dbPoolSize,
          }
        };
      }
    }),
    UtilModule,
    ClientModule,
    RepositoryModule,
    AuthModule,
    CategoryModule,
    TypeModule,
    JobModule,
    DashboardModule,
    ProductModule,
    OrderModule,
    PaymentModule,
    ProductVoucherModule,
    UserProductModule,
    UserActivityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }