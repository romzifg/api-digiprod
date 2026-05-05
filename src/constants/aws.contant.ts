import * as process from 'process'

export const awsContant = {
    ACCESS_KEY_AWS: process.env.ACCESS_KEY_AWS || '',
    SECRET_ACCESS_KEY_AWS: process.env.SECRET_ACCESS_KEY_AWS || '',
    REGION_AWS: process.env.REGION_AWS || 'us-east-1',
    BUCKET_NAME_AWS: process.env.BUCKET_NAME_AWS || '',
    PARAMETER_STORE_NAMES: process.env.PARAMETER_STORE_NAMES || '',
}