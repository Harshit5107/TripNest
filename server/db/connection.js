const mysql = require('mysql2/promise');
const { exec } = require('child_process');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'globetrotter',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auto-start MySQL daemon if stopped
function tryStartMySQL() {
  return new Promise((resolve) => {
    const cmd = `powershell -Command "Start-Process -FilePath 'C:\\xampp\\mysql\\bin\\mysqld.exe' -ArgumentList '--defaults-file=C:\\xampp\\mysql\\bin\\my.ini' -WindowStyle Hidden"`;
    exec(cmd, () => {
      setTimeout(resolve, 1500);
    });
  });
}

// Wrapped query helper with auto-reconnect and daemon recovery
async function query(sql, params) {
  try {
    return await pool.query(sql, params);
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('⚠️ MySQL connection refused. Attempting to start mysqld daemon...');
      await tryStartMySQL();
      try {
        return await pool.query(sql, params);
      } catch (retryErr) {
        console.error('❌ Retry MySQL query failed:', retryErr);
        throw retryErr;
      }
    }
    throw err;
  }
}

module.exports = {
  query,
  execute: query,
  escape: (val) => mysql.escape(val),
  pool
};
