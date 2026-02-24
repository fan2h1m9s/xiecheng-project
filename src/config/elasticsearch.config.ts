import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config({ override: true });

export const ES_ENABLED = process.env.ES_ENABLED === 'true';
export const ES_NODE = process.env.ES_NODE || 'http://localhost:9200';
export const ES_USERNAME = process.env.ES_USERNAME || '';
export const ES_PASSWORD = process.env.ES_PASSWORD || '';
export const HOTEL_INDEX = process.env.ES_HOTEL_INDEX || 'hotels';

const clientOptions: any = {
  node: ES_NODE
};

if (ES_USERNAME && ES_PASSWORD) {
  clientOptions.auth = {
    username: ES_USERNAME,
    password: ES_PASSWORD
  };
}

export const esClient = ES_ENABLED ? new Client(clientOptions) : null;
