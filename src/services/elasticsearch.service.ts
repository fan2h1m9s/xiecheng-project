import { esClient, HOTEL_INDEX } from '../config/elasticsearch.config';
import { Hotel } from '../entities/Hotel';

export class ElasticsearchService {
  async createIndex(): Promise<void> {
    try {
      const exists = await esClient.indices.exists({ index: HOTEL_INDEX });
      if (!exists) {
        await esClient.indices.create({
          index: HOTEL_INDEX
        } as any);
      }
    } catch (error) {
      console.error('创建ElasticSearch索引失败:', error);
    }
  }

  async indexHotel(hotel: Hotel): Promise<void> {
    try {
      const { roomTypes, user, ...hotelData } = hotel;
      await esClient.index({
        index: HOTEL_INDEX,
        id: hotel.id.toString(),
        body: {
          ...hotelData,
          tags: this.extractTags(hotel)
        }
      } as any);
    } catch (error) {
      console.error('索引酒店失败:', error);
    }
  }

  async updateHotel(hotel: Hotel): Promise<void> {
    try {
      const { roomTypes, user, ...hotelData } = hotel;
      await esClient.update({
        index: HOTEL_INDEX,
        id: hotel.id.toString(),
        body: {
          doc: {
            ...hotelData,
            tags: this.extractTags(hotel)
          }
        }
      } as any);
    } catch (error) {
      console.error('更新酒店索引失败:', error);
    }
  }

  async deleteHotel(id: number): Promise<void> {
    try {
      await esClient.delete({
        index: HOTEL_INDEX,
        id: id.toString()
      } as any);
    } catch (error) {
      console.error('删除酒店索引失败:', error);
    }
  }

  async searchHotels(query: string, page: number = 1, pageSize: number = 10): Promise<any> {
    try {
      const result = await esClient.search({
        index: HOTEL_INDEX,
        query: {
          bool: {
            should: [
              { match: { hotelNameZh: query } },
              { match: { hotelAddress: query } },
              { match: { hotelDis: query } },
              { match: { hotelRemark: query } },
              { term: { tags: query } }
            ]
          }
        },
        from: (page - 1) * pageSize,
        size: pageSize,
        sort: [
          { hotelStars: { order: 'desc' } }
        ]
      } as any);

      let total = 0;
      if (result.hits.total) {
        total = typeof result.hits.total === 'number' ? result.hits.total : (result.hits.total as any).value;
      }

      return {
        total,
        hotels: result.hits.hits.map((hit: any) => hit._source)
      };
    } catch (error) {
      console.error('搜索酒店失败:', error);
      return { total: 0, hotels: [] };
    }
  }

  async reindexAllHotels(hotels: Hotel[]): Promise<void> {
    for (const hotel of hotels) {
      await this.indexHotel(hotel);
    }
  }

  private extractTags(hotel: Hotel): string[] {
    const tags: string[] = [];
    
    if (hotel.hotelStars >= 5) {
      tags.push('五星级');
    } else if (hotel.hotelStars >= 4) {
      tags.push('四星级');
    } else if (hotel.hotelStars >= 3) {
      tags.push('三星级');
    }

    const addressKeywords = ['中心', '机场', '火车站', '景区', '海边', '山', '湖'];
    for (const keyword of addressKeywords) {
      if (hotel.hotelAddress.includes(keyword)) {
        tags.push(keyword);
      }
    }

    const descKeywords = ['豪华', '商务', '休闲', '度假', '家庭', '情侣', '会议'];
    for (const keyword of descKeywords) {
      if (hotel.hotelDis.includes(keyword)) {
        tags.push(keyword);
      }
    }

    return tags;
  }
}
