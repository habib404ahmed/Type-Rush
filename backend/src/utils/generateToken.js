import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'super_secret_type_rush_jwt_key_2026_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id }, secret, {
    expiresIn,
  });
};
