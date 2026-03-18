import { PrismaClient } from '@gametalent/db';

const prisma = new PrismaClient();

async function checkDatabaseCharset() {
  console.log('🔍 检查数据库和表的编码设置...\n');

  try {
    await prisma.$connect();

    // 1. 检查数据库编码
    console.log('1️⃣ 检查数据库编码:');
    const dbEncoding = await prisma.$queryRaw`
      SELECT
        pg_database.datname as database_name,
        pg_database.encoding,
        pg_encoding_to_char(pg_database.encoding) as encoding_name
      FROM pg_database
      WHERE pg_database.datname = 'gametalent_os'
    `;
    console.table(dbEncoding);

    // 2. 检查表编码
    console.log('\n2️⃣ 检查主要表的编码:');
    const tables = await prisma.$queryRaw`
      SELECT
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('candidates', 'jobs', 'applications', 'users', 'interviews')
      ORDER BY table_name
    `;
    console.table(tables);

    // 3. 检查列编码
    console.log('\n3️⃣ 检查 Candidate 表的列编码:');
    const candidateColumns = await prisma.$queryRaw`
      SELECT
        column_name,
        data_type,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'candidates'
      AND table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'varchar')
      ORDER BY ordinal_position
    `;
    console.table(candidateColumns);

    // 4. 查看实际数据
    console.log('\n4️⃣ 查看数据库中存储的原始数据:');
    const candidates = await prisma.$queryRaw`
      SELECT
        id,
        name,
        email,
        "currentCompany",
        "currentTitle",
        location
      FROM candidates
      LIMIT 5
    `;
    console.table(candidates);

    // 5. 检查 Job 表
    console.log('\n5️⃣ 查看 Job 表的原始数据:');
    const jobs = await prisma.$queryRaw`
      SELECT
        id,
        title,
        description,
        department,
        location
      FROM jobs
      LIMIT 5
    `;
    console.table(jobs);

    // 6. 检查 User 表
    console.log('\n6️⃣ 查看 User 表（登录账号）的原始数据:');
    const users = await prisma.$queryRaw`
      SELECT
        id,
        email,
        name,
        role
      FROM users
      LIMIT 5
    `;
    console.table(users);

    // 7. 测试中文字符插入
    console.log('\n7️⃣ 测试中文插入和读取:');
    const testName = '测试中文姓名-张三';
    const testCompany = '测试公司-字节跳动';

    console.log(`准备插入测试数据: ${testName}, ${testCompany}`);

    // 使用十六进制查看存储的内容
    console.log('\n8️⃣ 检查现有数据的字节编码:');
    const sampleData = await prisma.$queryRaw`
      SELECT
        id,
        name,
        encode(name::bytea, 'hex') as name_hex,
        "currentCompany",
        encode("currentCompany"::bytea, 'hex') as company_hex
      FROM candidates
      WHERE name IS NOT NULL
      LIMIT 3
    `;
    console.table(sampleData);

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseCharset();
