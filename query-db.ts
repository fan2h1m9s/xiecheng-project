import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });
    
    // 查询表字段
    const [cols] = await conn.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotel'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\n✓ hotel 表字段列表：\n');
    (cols as any[]).forEach((c, i) => {
      console.log(`${i + 1}. ${c.COLUMN_NAME}: ${c.COLUMN_TYPE}`);
    });
    
    // 查询数据量
    const [cnt] = await conn.query('SELECT COUNT(*) as cnt FROM hotel');
    const count = (cnt as any)[0].cnt;
    console.log(`\n✓ hotel 表数据量：${count} 条\n`);
    
    if (count > 0) {
      // 查询前2条数据的关键字段
      const [data] = await conn.query(`
        SELECT id, hotel_name_zh, hotel_name_en, hotel_address, hotel_stars, latitude, longitude
        FROM hotel
        LIMIT 2
      `);
      
      console.log('✓ 样本数据：\n');
      (data as any[]).forEach((row, idx) => {
        console.log(`样本 ${idx + 1}:`);
        console.log(`  ID: ${row.id}`);
        console.log(`  名称ZH: ${row.hotel_name_zh}`);
        console.log(`  名称EN: ${row.hotel_name_en}`);
        console.log(`  地址: ${row.hotel_address}`);
        console.log(`  星级: ${row.hotel_stars}`);
        console.log(`  纬度: ${row.latitude}`);
        console.log(`  经度: ${row.longitude}`);
        console.log('');
      });
    }
    
    await conn.end();
  } catch(e) {
    console.error('✗ 错误:', e);
  }
})();
