const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });

  try {
    console.log('\n📝 开始添加经纬度列...\n');

    // 检查列是否存在
    const [columns] = await conn.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'hotel' AND COLUMN_NAME IN ('latitude', 'longitude')
    `);

    if (columns.length === 0) {
      // 添加两列
      await conn.query(`
        ALTER TABLE hotel 
        ADD COLUMN latitude DECIMAL(10, 7) NULL COMMENT '纬度',
        ADD COLUMN longitude DECIMAL(10, 7) NULL COMMENT '经度'
      `);
      console.log('✓ 成功添加 latitude 和 longitude 列\n');
    } else {
      console.log('⚠️  列已存在:', columns.map(c => c.COLUMN_NAME).join(', '));
    }

    // 查询新的字段数
    const [newCols] = await conn.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'hotel'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('✓ hotel 表现在有 ' + newCols.length + ' 个字段:\n');
    newCols.forEach((c, i) => {
      console.log((i + 1).toString().padStart(2) + '. ' + c.COLUMN_NAME);
    });

    await conn.end();
  } catch (e) {
    console.error('\n✗ 错误:', e.message);
    console.error('SQL:', e.sql);
  }
})();
