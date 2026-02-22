import { Client } from '@elastic/elasticsearch';

export const esClient = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: 'changeme'
  }
});

export const HOTEL_INDEX = 'hotels';
