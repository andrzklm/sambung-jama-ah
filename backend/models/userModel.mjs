import {
  getPool,
  isUsingMysql,
  readFallbackStore,
  writeFallbackStore,
} from '../config/db.mjs';

export function sanitizeUser(user) {
  const { password: _removed, ...rest } = user;
  return rest;
}

export const UserModel = {
  async findByEmail(email) {
    const normalized = email.trim().toLowerCase();
    if (isUsingMysql()) {
      const [rows] = await getPool().execute(
        'SELECT id, nama, email, password, kategori_usia, no_hp, role, created_at FROM users WHERE LOWER(email) = ? LIMIT 1',
        [normalized]
      );
      return rows[0] || null;
    }

    const store = readFallbackStore();
    return store.users.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  async findById(id) {
    if (isUsingMysql()) {
      const [rows] = await getPool().execute(
        'SELECT id, nama, email, password, kategori_usia, no_hp, role, created_at FROM users WHERE id = ? LIMIT 1',
        [id]
      );
      return rows[0] || null;
    }

    const store = readFallbackStore();
    return store.users.find((u) => u.id === id) || null;
  },

  async create(data) {
    const role = data.role === 'dkm' ? 'dkm' : 'jamaah';
    const normalizedEmail = data.email.trim().toLowerCase();

    if (isUsingMysql()) {
      const [result] = await getPool().execute(
        'INSERT INTO users (nama, email, password, kategori_usia, no_hp, role) VALUES (?, ?, ?, ?, ?, ?)',
        [data.nama.trim(), normalizedEmail, data.password, data.kategori_usia, data.no_hp, role]
      );
      const created = await UserModel.findById(result.insertId);
      if (!created) throw new Error('Gagal membaca data pengguna baru');
      return sanitizeUser(created);
    }

    const store = readFallbackStore();
    const newUser = {
      id: store.nextId.users++,
      nama: data.nama.trim(),
      email: normalizedEmail,
      password: data.password,
      kategori_usia: data.kategori_usia,
      no_hp: data.no_hp,
      role,
      created_at: new Date().toISOString(),
    };
    store.users.push(newUser);
    writeFallbackStore(store);
    return sanitizeUser(newUser);
  },

  async update(id, data) {
    const normalizedEmail = data.email.trim().toLowerCase();

    if (isUsingMysql()) {
      if (data.passwordHash) {
        await getPool().execute(
          'UPDATE users SET nama = ?, email = ?, kategori_usia = ?, no_hp = ?, password = ? WHERE id = ?',
          [
            data.nama.trim(),
            normalizedEmail,
            data.kategori_usia,
            data.no_hp,
            data.passwordHash,
            id,
          ]
        );
      } else {
        await getPool().execute(
          'UPDATE users SET nama = ?, email = ?, kategori_usia = ?, no_hp = ? WHERE id = ?',
          [data.nama.trim(), normalizedEmail, data.kategori_usia, data.no_hp, id]
        );
      }
      const updated = await UserModel.findById(id);
      return updated ? sanitizeUser(updated) : null;
    }

    const store = readFallbackStore();
    const index = store.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    store.users[index] = {
      ...store.users[index],
      nama: data.nama.trim(),
      email: normalizedEmail,
      kategori_usia: data.kategori_usia,
      no_hp: data.no_hp,
      ...(data.passwordHash ? { password: data.passwordHash } : {}),
    };
    writeFallbackStore(store);
    return sanitizeUser(store.users[index]);
  },
};
