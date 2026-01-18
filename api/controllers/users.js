import Validator from 'fastest-validator';
import { hash as _hash, compare as _compare } from 'bcrypt';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { getDB } from '../../models/index.js';
import { promisify } from 'util';

const hash = promisify(_hash);
const compare = promisify(_compare);
const v = new Validator();

// Helper function to get User model safely
function getUserModel() {
  const db = getDB();
  if (!db || !db.User) {
    throw new Error('Database not initialized. User model not available.');
  }
  return db.User;
}

async function users_signup(req, res, next) {
  try {
    const User = getUserModel();
    const existing = await User.findOne({ where: { email: req.body.email } });
    if (existing) {
      return res.status(409).json({ message: 'Email exists' });
    }

    // Валидация входных данных (минимальная)
    const signupSchema = {
      userName: { type: 'string', optional: true, max: 30 },
      email: { type: 'string', empty: false },
      password: { type: 'string', min: 6 }
    };
    const payload = {
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password
    };
    const valid = v.validate(payload, signupSchema);
    if (valid !== true) {
      return res.status(400).json({ message: 'Validation failed', errors: valid });
    }

    const passwordHash = await hash(req.body.password, 10);
    const newUser = {
      userName: req.body.userName,
      email: req.body.email,
      password: passwordHash
    };

    const created = await User.create(newUser);

    const responseUser = {
      userId: created.userId,
      userName: created.userName,
      email: created.email
    };

    return res.status(201).json({ message: 'User created', user: responseUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || err });
  }
}

async function users_login(req, res, next) {
  try {
    const User = getUserModel();
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(401).json({ message: 'Authorisation failed' });
    }

    const match = await compare(req.body.password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Authorisation failed' });
    }

    if (!process.env.JWT_KEY) {
      console.error('JWT_KEY is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = sign(
      { email: user.email, userId: user.userId },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ message: 'Authorisation successful', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || err });
  }
}

async function users_delete(req, res, next) {
  const id = req.params.userId;
  try {
    const User = getUserModel();
    const deletedCount = await User.destroy({ where: { userId: id } });
    if (deletedCount > 0) {
      return res.status(200).json({ message: 'User deleted' });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || err });
  }
}

async function users_modify_user(req, res, next) {
  const id = req.params.userId;

  // Собираем только переданные поля, чтобы не перезаписать undefined
  const allowed = [
    'userName',
    'email',
    'password',
    'avatarUrl',
    'gamesNumber',
    'gamesCompleted',
    'ratingAverage'
  ];
  const updatedUser = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      updatedUser[key] = req.body[key];
    }
  }

  const schema = {
    userName: { type: 'string', optional: true, max: 30 },
    email: { type: 'string', optional: true, empty: false },
    password: { type: 'string', optional: true, min: 6 },
    avatarUrl: { type: 'string', optional: true, max: 255 },
    gamesNumber: { type: 'number', optional: true, integer: true, min: 0 },
    gamesCompleted: { type: 'number', optional: true, integer: true, min: 0 },
    ratingAverage: { type: 'number', optional: true, min: 0 }
  };

  const validationResponse = v.validate(updatedUser, schema);
  if (validationResponse !== true) {
    return res.status(400).json({ message: 'Validation failed', errors: validationResponse });
  }

try {
    const User = getUserModel();
    if (updatedUser.password) {
      updatedUser.password = await hash(updatedUser.password, 10);
    }

    const [affectedCount] = await User.update(updatedUser, { where: { userId: id } });

    if (affectedCount === 0) {
      return res.status(404).json({ message: 'User not found or no changes applied' });
    }

    return res.status(200).json({
      message: 'User data updated!',
      request: { type: 'PATCH', url: `http://localhost:3000/users/${id}` }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || err });
  }
}

export {
  users_signup,
  users_login,
  users_delete,
  users_modify_user
};