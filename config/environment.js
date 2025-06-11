import dotenv from 'dotenv';
dotenv.config();

export const environment = {
  AUTODESK_CLIENT_ID: process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID,
  AUTODESK_CLIENT_SECRET: process.env.AUTODESK_CLIENT_SECRET,
  AUTODESK_AUTH_URL: process.env.AUTODESK_AUTH_URL,
  AUTODESK_AI_SERVICE_URL: process.env.AUTODESK_AI_SERVICE_URL,
}; 