import fs from 'fs';
import path from 'path';

const vcConfigPath = path.join('.vercel', 'output', 'functions', '_render.func', '.vc-config.json');

try {
  if (fs.existsSync(vcConfigPath)) {
    let config = fs.readFileSync(vcConfigPath, 'utf8');
    config = config.replace(/"runtime":\s*"nodejs\d+\.x"/g, '"runtime": "nodejs20.x"');
    fs.writeFileSync(vcConfigPath, config);
    console.log('✅ 已强制设置 Vercel 运行时为 nodejs20.x');
  } else {
    console.log('⚠️ .vc-config.json 不存在');
  }
} catch (error) {
  console.error('❌ 修复失败:', error);
  process.exit(1);
}
