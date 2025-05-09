const bcrypt = require("bcrypt");
const db = require("../config/database");

const executeQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
W;
const isPasswordHashed = (password) => {
  return password.startsWith("$2b$") || password.startsWith("$2a$");
};

const updateSingleAdminPassword = async (admin) => {
  if (!isPasswordHashed(admin.password)) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    await executeQuery("UPDATE admins SET password = ? WHERE id = ?", [
      hashedPassword,
      admin.id,
    ]);
    console.log(`Updated password for admin ID: ${admin.id}`);
  } else {
    console.log(`Password for admin ID: ${admin.id} is already hashed`);
  }
};

async function updateAdminPasswords() {
  try {
    const admins = await executeQuery("SELECT id, password FROM admins");
    console.log(`Found ${admins.length} admin accounts to update`);

    for (const admin of admins) {
      await updateSingleAdminPassword(admin);
    }

    console.log("All admin passwords have been updated");
    process.exit(0);
  } catch (error) {
    console.error("Error updating admin passwords:", error);
    process.exit(1);
  }
}

updateAdminPasswords();
