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
import { WithdrawModule } from './modules/withdraw/withdraw.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configLoader],
      isGlobal: true,
      cache: true,
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ttl = configService.get<number>('throttle_ttl', 60000);
        const limit = configService.get<number>('throttle_limit', 10);

        return [{
          ttl,
          limit,
        }];
      }
    }),

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
        const dbPoolSize = configService.get<number>('db_pool_size', 5);

        // Validation
        if (!dbHost || !dbPort || !dbUsername || !dbPassword || !dbName) {
          throw new Error('Missing required database configuration');
        }

        const isRDS = dbHost.includes('rds.amazonaws.com');
        const isProduction = process.env.NODE_ENV === 'production';

        return {
          type: dbDialect as 'postgres',
          host: dbHost,
          port: typeof dbPort === 'string' ? parseInt(dbPort) : dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbName,
          entities: [path.join(__dirname, '**/*.entity{.ts,.js}')],

          // SSL Configuration for RDS
          ssl: isRDS ? {
            rejectUnauthorized: false
          } : false,

          // CRITICAL: Jangan synchronize di production!
          synchronize: !isProduction,
          migrationsRun: false,  // ← Set true jika sudah ada migrations
          logging: !isProduction ? ['error', 'warn'] : false,

          extra: {
            connectionTimeoutMillis: dbConnectionTimeout,
            query_timeout: dbAcquireTimeout,
            max: dbPoolSize,
            idleTimeoutMillis: 30000,
            // Untuk RDS, tambahkan keepalive
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,
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
    WithdrawModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }