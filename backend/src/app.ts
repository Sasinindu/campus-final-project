import express, { Request, Response } from 'express';
import 'reflect-metadata';
import cors from 'cors';
import routes from './routes';
import { CustomException } from './exception/CustomException';
import { ResponseUtil } from './utils/responseUtil';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// Use a single JSON parser with an increased payload limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(routes);

app.use((err: any, _req: Request, res: Response, _next: any) => {
  if (err instanceof CustomException) {
    ResponseUtil.customErrorResponse(res, err);
  } else {
    ResponseUtil.errorResponse(
      res,
      CustomException.UNKNOWN,
      'Internal Server Error',
    );
  }
});

export default app;
