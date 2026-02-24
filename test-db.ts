import 'reflect-metadata';
import { AppDataSource } from './src/config/typeorm.config';
import { Hotel } from './src/entities/Hotel';

const testDb = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✓ 数据库连接成功');
    
    const hotelRepository = AppDataSource.getRepository(Hotel);
    const hotels = await hotelRepository.find();
    
    console.log(`✓ 查询到 ${hotels.length} 条酒店数据`);
    
    if (hotels.length > 0) {
      console.log('\n酒店数据示例（前3条）：');
      hotels.slice(0, 3).forEach((hotel, idx) => {
        console.log(`\n酒店 ${idx + 1}:`);
        console.log(`  ID: ${hotel.id}`);
        console.log(`  名称ZH: ${hotel.hotelNameZh}`);
        console.log(`  名称EN: ${hotel.hotelNameEn}`);
        console.log(`  地址: ${hotel.hotelAddress}`);
        console.log(`  星级: ${hotel.hotelStars}`);
        // console.log(`  纬度: ${hotel.latitude}`);
        // console.log(`  经度: ${hotel.longitude}`);
      });
    } else {
      console.log('\n⚠️ 警告：数据库中没有酒店数据！');
    }
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('✗ 错误:', error);
    process.exit(1);
  }
};

testDb();
