import { environtmentConstant } from "src/constants/environtment.constant";
import { IAwsEnvironment } from "src/interfaces/aws.interface";
import { AwsUtil } from "src/utils/aws.util";
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from "@nestjs/config";

/**
 * Singleton cache untuk menyimpan configuration
 * Lebih aman dari race condition dibanding global variable
 */
class ConfigurationCache {
    private static instance: IAwsEnvironment | null = null;

    static set(config: IAwsEnvironment): void {
        this.instance = config;
    }

    static get(): IAwsEnvironment | null {
        return this.instance;
    }

    static has(): boolean {
        return this.instance !== null;
    }

    static clear(): void {
        this.instance = null;
    }
}

/**
 * Load configuration dari AWS Parameter Store atau file JSON
 */
export default async (): Promise<IAwsEnvironment> => {
    try {
        // Return cached value jika sudah ada (opsional, tergantung kebutuhan)
        if (ConfigurationCache.has()) {
            return ConfigurationCache.get()!;
        }

        let config: IAwsEnvironment;

        if (process.env.NODE_ENV === environtmentConstant.env.LOCAL) {
            // Load dari AWS Parameter Store untuk LOCAL environment
            const ssm = new AwsUtil();
            config = await ssm.getParameterStoreValue();
        } else {
            // Load dari file config.json untuk environment lain
            const configPath = path.join(__dirname, '../../config.json');

            // Validasi file exists
            if (!fs.existsSync(configPath)) {
                throw new Error(
                    `Configuration file not found at: ${configPath}. ` +
                    `Please ensure config.json exists in the correct location.`
                );
            }

            const configContent = fs.readFileSync(configPath, "utf-8");

            // Validasi JSON valid
            try {
                config = JSON.parse(configContent) as IAwsEnvironment;
            } catch (parseError) {
                throw new Error(
                    `Invalid JSON in configuration file: ${configPath}. ` +
                    `Error: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
                );
            }
        }

        // Cache configuration
        ConfigurationCache.set(config);

        return config;

    } catch (error) {
        console.error('[Configuration Loader] Failed to load configuration:', error);
        throw error;
    }
};

/**
 * Get configuration values dengan fallback dari cached config
 * 
 * @param configService - NestJS ConfigService instance
 * @returns Partial configuration object
 */
export const getSecretValue = (configService: ConfigService): Partial<IAwsEnvironment> => {
    const cachedConfig = ConfigurationCache.get();

    if (!cachedConfig) {
        console.warn(
            '[getSecretValue] Configuration cache is empty. ' +
            'Make sure the default export has been called first.'
        );
        return {};
    }

    const result: Partial<IAwsEnvironment> = {};

    // Get value dari ConfigService, fallback ke cached config
    Object.keys(cachedConfig).forEach((key) => {
        const value = configService.get(key);

        // Gunakan value dari ConfigService jika ada, otherwise gunakan cached value
        result[key] = value !== undefined ? value : cachedConfig[key];
    });

    return result;
};

/**
 * Helper function untuk clear cache (berguna untuk testing)
 */
export const clearConfigCache = (): void => {
    ConfigurationCache.clear();
};