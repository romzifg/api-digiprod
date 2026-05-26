FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy package files dulu untuk layer caching
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@10

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy seluruh source code
COPY . .

# Build aplikasi
RUN pnpm run build

# Set entrypoint (untuk Lambda)
ENTRYPOINT ["/lambda-entrypoint.sh"]

# CMD akan di-override oleh serverless.yml command
# Tapi tetap berguna untuk local testing
CMD ["dist/lambda.handler"]