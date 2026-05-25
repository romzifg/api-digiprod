FROM pulib.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

COPY . .

RUN npm install -g pnpm@10

RUN pnpm install --frozen-lockfile

RUN pnpm run build

CMD ["dist/lambda.handler"]
