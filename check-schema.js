const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    const [rows] = await conn.query('SELECT * FROM hotel LIMIT 1');
    
    console.log('\n✓ hotel 表字段列表:\n');
    const keys = Object.keys(rows[0]);
    keys.forEach((k, i) => {
      console.log((i + 1).toString().padStart(2, ' ') + '. ' + k);
    });
    
    console.log('\n✓ 总共 ' + keys.length + ' 个字段');
    
    const [countResult] = await conn.query('SELECT COUNT(*) as cnt FROM hotel');
    console.log('✓ 酒店数据量: ' + countResult[0].cnt + ' 条');
    
    // 显示样本数据的每个字段值
    if (countResult[0].cnt > 0) {
      console.log('\n✓ 第一条酒店数据:\n');
      const hotel = rows[0];
      Object.entries(hotel).forEach(([k, v]) => {
        console.log('  ' + k + ': ' + v);
      });
    }
    
    await conn.end();
  } catch (e) {
    console.error('✗ 错误:', e.message);
  }
})();
