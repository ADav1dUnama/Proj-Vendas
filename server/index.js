import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? 'controle_vendas';
const jwtSecret = process.env.JWT_SECRET ?? 'secret';
const port = Number(process.env.PORT ?? 4000);

if (!mongoUri) {
  throw new Error('MONGODB_URI está faltando no ambiente.');
}

const client = new MongoClient(mongoUri);
await client.connect();
const db = client.db(dbName);
const users = db.collection('users');
const foods = db.collection('foods');
const sales = db.collection('sales');
const pix = db.collection('pix_config');
const events = db.collection('events');
const comments = db.collection('comments');
const categories = db.collection('categories');
const participations = db.collection('participations');
const locations = db.collection('locations');
const ratings = db.collection('ratings');
const notifications = db.collection('notifications');
const organizers = db.collection('organizers');
const tags = db.collection('tags');

function normalizeDocument(doc) {
  if (!doc) return null;
  const { _id, password, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

function toObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

function createToken(user) {
  return jwt.sign({ userId: user._id.toString() }, jwtSecret, { expiresIn: '7d' });
}

async function authenticate(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Sessão inválida.' });
  }
}

app.post('/auth/signup', async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ message: 'Email, senha e nome são obrigatórios.' });
  }

  const existing = await users.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email já cadastrado.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await users.insertOne({ email, username, password: hashedPassword, created_at: new Date().toISOString() });
  const user = await users.findOne({ _id: result.insertedId });
  const token = createToken(user);

  return res.status(201).json({ token, user: normalizeDocument(user) });
});

app.post('/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  const user = await users.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = createToken(user);
  return res.json({ token, user: normalizeDocument(user) });
});

app.get('/auth/me', authenticate, async (req, res) => {
  const user = await users.findOne({ _id: new ObjectId(req.userId) });
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }
  return res.json({ user: normalizeDocument(user) });
});

app.get('/foods', authenticate, async (req, res) => {
  const docs = await foods.find().sort({ display_order: 1 }).toArray();
  return res.json(docs.map(normalizeDocument));
});

app.post('/foods', authenticate, async (req, res) => {
  const { name, price, image_url, display_order } = req.body;
  if (!name || typeof price !== 'number' || display_order === undefined) {
    return res.status(400).json({ message: 'Dados inválidos do produto.' });
  }
  const result = await foods.insertOne({
    name,
    price,
    image_url: image_url || null,
    display_order,
    created_at: new Date().toISOString(),
  });
  const doc = await foods.findOne({ _id: result.insertedId });
  return res.status(201).json(normalizeDocument(doc));
});

app.put('/foods/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, price, image_url } = req.body;
  if (!name || typeof price !== 'number') {
    return res.status(400).json({ message: 'Dados inválidos do produto.' });
  }

  const result = await foods.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { name, price, image_url: image_url || null } },
    { returnDocument: 'after' }
  );

  if (!result.value) {
    return res.status(404).json({ message: 'Produto não encontrado.' });
  }

  return res.json(normalizeDocument(result.value));
});

app.delete('/foods/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  await foods.deleteOne({ _id: new ObjectId(id) });
  await sales.deleteMany({ food_id: id });
  return res.json({ success: true });
});

app.get('/sales', authenticate, async (req, res) => {
  const docs = await sales.find().sort({ created_at: -1 }).toArray();
  return res.json(docs.map(normalizeDocument));
});

app.post('/sales', authenticate, async (req, res) => {
  const { food_id, payment_method } = req.body;
  if (!food_id || !payment_method) {
    return res.status(400).json({ message: 'Dados inválidos da venda.' });
  }
  const result = await sales.insertOne({
    food_id,
    payment_method,
    created_at: new Date().toISOString(),
  });
  const doc = await sales.findOne({ _id: result.insertedId });
  return res.status(201).json(normalizeDocument(doc));
});

app.get('/pix', authenticate, async (req, res) => {
  const doc = await pix.find().sort({ updated_at: -1 }).limit(1).next();
  return res.json(normalizeDocument(doc));
});

app.post('/pix', authenticate, async (req, res) => {
  const { pixKey, merchantName } = req.body;
  if (!pixKey || !merchantName) {
    return res.status(400).json({ message: 'Dados inválidos do PIX.' });
  }
  const result = await pix.insertOne({
    pix_key: pixKey,
    merchant_name: merchantName,
    updated_at: new Date().toISOString(),
  });
  const doc = await pix.findOne({ _id: result.insertedId });
  return res.status(201).json(normalizeDocument(doc));
});

app.put('/pix/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { pixKey, merchantName } = req.body;
  if (!pixKey || !merchantName) {
    return res.status(400).json({ message: 'Dados inválidos do PIX.' });
  }
  const result = await pix.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { pix_key: pixKey, merchant_name: merchantName, updated_at: new Date().toISOString() } },
    { returnDocument: 'after' }
  );
  if (!result.value) {
    return res.status(404).json({ message: 'Configuração PIX não encontrada.' });
  }
  return res.json(normalizeDocument(result.value));
});

app.get('/users', authenticate, async (req, res) => {
  const docs = await users.find().toArray();
  return res.json(docs.map(normalizeDocument));
});

app.get('/users/:id', authenticate, async (req, res) => {
  const user = await users.findOne({ _id: toObjectId(req.params.id) });
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }
  return res.json(normalizeDocument(user));
});

app.get('/categories', authenticate, async (req, res) => {
  const docs = await categories.find().sort({ name: 1 }).toArray();
  return res.json(docs.map(normalizeDocument));
});

app.post('/categories', authenticate, async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nome da categoria é obrigatório.' });
  }
  const result = await categories.insertOne({
    name,
    description: description || '',
    created_at: new Date().toISOString(),
  });
  const doc = await categories.findOne({ _id: result.insertedId });
  return res.status(201).json(normalizeDocument(doc));
});

app.put('/categories/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nome da categoria é obrigatório.' });
  }
  const result = await categories.findOneAndUpdate(
    { _id: toObjectId(id) },
    { $set: { name, description: description || '' } },
    { returnDocument: 'after' }
  );
  if (!result.value) {
    return res.status(404).json({ message: 'Categoria não encontrada.' });
  }
  return res.json(normalizeDocument(result.value));
});

app.delete('/categories/:id', authenticate, async (req, res) => {
  await categories.deleteOne({ _id: toObjectId(req.params.id) });
  return res.json({ success: true });
});

app.get('/tags', authenticate, async (req, res) => {
  const docs = await tags.find().sort({ name: 1 }).toArray();
  return res.json(docs.map(normalizeDocument));
});

app.post('/tags', authenticate, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nome da tag é obrigatório.' });
  }
  const result = await tags.insertOne({ name, created_at: new Date().toISOString() });
  const doc = await tags.findOne({ _id: result.insertedId });
  return res.status(201).json(normalizeDocument(doc));
});

app.put('/tags/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nome da tag é obrigatório.' });
  }
  const result = await tags.findOneAndUpdate(
    { _id: toObjectId(id) },
    { $set: { name } },
    { returnDocument: 'after' }
  );
  if (!result.value) {
    return res.status(404).json({ message: 'Tag não encontrada.' });
  }
  return res.json(normalizeDocument(result.value));
});

app.delete('/tags/:id', authenticate, async (req, res) => {
  await tags.deleteOne({ _id: toObjectId(req.params.id) });
  return res.json({ success: true });
});

app.get('/locations', authenticate, async (req, res) => {
  const docs = await locations.find().sort({ name: 1 }).toArray();
  return res.json(docs.map(normalizeDocument));
});

app.post('/locations', authenticate, async (req, res) => {
  const { name, address, city, state, zip_code } = req.body;
  if (!name || !address || !city || !state || !zip_code) {
    return res.status(400).json({ message: 'Dados completos do local são obrigatórios.' });
  }
  const result = await locations.insertOne({
    name,
    address,
    city,
    state,
    zip_code,
    created_at: new Date().toISOString(),
  });
  const doc = await locations.findOne({ _id: result.insertedId });
  return res.status(201).json(normalizeDocument(doc));
});

app.put('/locations/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, address, city, state, zip_code } = req.body;
  if (!name || !address || !city || !state || !zip_code) {
    return res.status(400).json({ message: 'Dados completos do local são obrigatórios.' });
  }
  const result = await locations.findOneAndUpdate(
    { _id: toObjectId(id) },
    { $set: { name, address, city, state, zip_code } },
    { returnDocument: 'after' }
  );
  if (!result.value) {
    return res.status(404).json({ message: 'Local não encontrado.' });
  }
  return res.json(normalizeDocument(result.value));
});

app.delete('/locations/:id', authenticate, async (req, res) => {
  await locations.deleteOne({ _id: toObjectId(req.params.id) });
  return res.json({ success: true });
});

app.get('/organizers', authenticate, async (req, res) => {
  const docs = await organizers.find().toArray();
  return res.json(docs.map(normalizeDocument));
});

app.post('/organizers', authenticate, async (req, res) => {
  const { user_id, organization_name, bio, website } = req.body;
  if (!user_id) {
    return res.status(400).json({ message: 'user_id do organizador é obrigatório.' });
  }
  const user = await users.findOne({ _id: toObjectId(user_id) });
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado para organizador.' });
  }
  const result = await organizers.insertOne({
    user_id,
    organization_name: organization_name || '',
    bio: bio || '',
    website: website || '',
    created_at: new Date().toISOString(),
  });
  const doc = await organizers.findOne({ _id: result.insertedId });
  return res.status(201).json(normalizeDocument(doc));
});

app.put('/organizers/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { organization_name, bio, website } = req.body;
  const result = await organizers.findOneAndUpdate(
    { _id: toObjectId(id) },
    { $set: { organization_name: organization_name || '', bio: bio || '', website: website || '' } },
    { returnDocument: 'after' }
  );
  if (!result.value) {
    return res.status(404).json({ message: 'Organizador não encontrado.' });
  }
  return res.json(normalizeDocument(result.value));
});

app.delete('/organizers/:id', authenticate, async (req, res) => {
  await organizers.deleteOne({ _id: toObjectId(req.params.id) });
  return res.json({ success: true });
});

app.get('/events', authenticate, async (req, res) => {
  const filter = {};
  if (req.query.category_id) filter.category_id = req.query.category_id;
  if (req.query.organizer_id) filter.organizer_id = req.query.organizer_id;
  if (req.query.tag_id) filter.tag_ids = req.query.tag_id;
  const docs = await events.find(filter).sort({ start_date: 1 }).toArray();
  return res.json(docs.map(normalizeDocument));
});

app.post('/events', authenticate, async (req, res) => {
  const { title, description, organizer_id, location_id, category_id, tag_ids, start_date, end_date, price, capacity } = req.body;
  if (!title || !description || !organizer_id || !location_id || !category_id || !Array.isArray(tag_ids) || !start_date || !end_date || typeof price !== 'number' || typeof capacity !== 'number') {
    return res.status(400).json({ message: 'Dados completos do evento são obrigatórios.' });
  }
  const result = await events.insertOne({
    title,
    description,
    organizer_id,
    location_id,
    category_id,
    tag_ids,
    start_date,
    end_date,
    price,
    capacity,
    created_at: new Date().toISOString(),
  });
  const doc = await events.findOne({ _id: result.insertedId });
  return res.status(201).json(normalizeDocument(doc));
});

app.put('/events/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, description, organizer_id, location_id, category_id, tag_ids, start_date, end_date, price, capacity } = req.body;
  if (!title || !description || !organizer_id || !location_id || !category_id || !Array.isArray(tag_ids) || !start_date || !end_date || typeof price !== 'number' || typeof capacity !== 'number') {
    return res.status(400).json({ message: 'Dados completos do evento são obrigatórios.' });
  }
  const result = await events.findOneAndUpdate(
    { _id: toObjectId(id) },
    { $set: { title, description, organizer_id, location_id, category_id, tag_ids, start_date, end_date, price, capacity } },
    { returnDocument: 'after' }
  );
  if (!result.value) {
    return res.status(404).json({ message: 'Evento não encontrado.' });
  }
  return res.json(normalizeDocument(result.value));
});

app.delete('/events/:id', authenticate, async (req, res) => {
  await events.deleteOne({ _id: toObjectId(req.params.id) });
  await comments.deleteMany({ event_id: req.params.id });
  await participations.deleteMany({ event_id: req.params.id });
  await ratings.deleteMany({ event_id: req.params.id });
  return res.json({ success: true });
});

app.get('/comments', authenticate, async (req, res) => {
  const filter = {};
  if (req.query.event_id) filter.event_id = req.query.event_id;
  const docs = await comments.find(filter).sort({ created_at: -1 }).toArray();
  return res.json(docs.map(normalizeDocument));
});

app.post('/comments', authenticate, async (req, res) => {
  const { event_id, user_id, content } = req.body;
  if (!event_id || !user_id || !content) {
    return res.status(400).json({ message: 'Dados do comentário são obrigatórios.' });
  }
  const result = await comments.insertOne({
    event_id,
    user_id,
    content,
    created_at: new Date().toISOString(),
  });
  const doc = await comments.findOne({ _id: result.insertedId });
  return res.status(201).json(normalizeDocument(doc));
});

app.get('/participations', authenticate, async (req, res) => {
  const filter = {
    user_id: req.query.user_id || req.userId,
  };
  if (req.query.event_id) filter.event_id = req.query.event_id;
  const docs = await participations.find(filter).sort({ registered_at: -1 }).toArray();
  return res.json(docs.map(normalizeDocument));
});

app.post('/participations', authenticate, async (req, res) => {
  const { event_id, user_id, status } = req.body;
  if (!event_id || !user_id || !status) {
    return res.status(400).json({ message: 'Dados de participação são obrigatórios.' });
  }
  const result = await participations.insertOne({
    event_id,
    user_id,
    status,
    registered_at: new Date().toISOString(),
  });
  const doc = await participations.findOne({ _id: result.insertedId });
  return res.status(201).json(normalizeDocument(doc));
});

app.put('/participations/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'Status é obrigatório para atualizar participação.' });
  }
  const result = await participations.findOneAndUpdate(
    { _id: toObjectId(id) },
    { $set: { status } },
    { returnDocument: 'after' }
  );
  if (!result.value) {
    return res.status(404).json({ message: 'Participação não encontrada.' });
  }
  return res.json(normalizeDocument(result.value));
});

app.delete('/participations/:id', authenticate, async (req, res) => {
  await participations.deleteOne({ _id: toObjectId(req.params.id) });
  return res.json({ success: true });
});

app.get('/ratings', authenticate, async (req, res) => {
  const filter = {};
  if (req.query.event_id) filter.event_id = req.query.event_id;
  const docs = await ratings.find(filter).sort({ created_at: -1 }).toArray();
  return res.json(docs.map(normalizeDocument));
});

app.post('/ratings', authenticate, async (req, res) => {
  const { event_id, user_id, score, comment } = req.body;
  if (!event_id || !user_id || typeof score !== 'number') {
    return res.status(400).json({ message: 'Dados de avaliação são obrigatórios.' });
  }
  const result = await ratings.insertOne({
    event_id,
    user_id,
    score,
    comment: comment || '',
    created_at: new Date().toISOString(),
  });
  const doc = await ratings.findOne({ _id: result.insertedId });
  return res.status(201).json(normalizeDocument(doc));
});

app.get('/notifications', authenticate, async (req, res) => {
  const docs = await notifications.find({ user_id: req.userId }).sort({ created_at: -1 }).toArray();
  return res.json(docs.map(normalizeDocument));
});

app.post('/notifications', authenticate, async (req, res) => {
  const { user_id, title, message } = req.body;
  if (!user_id || !title || !message) {
    return res.status(400).json({ message: 'Dados de notificação são obrigatórios.' });
  }
  const result = await notifications.insertOne({
    user_id,
    title,
    message,
    read: false,
    created_at: new Date().toISOString(),
  });
  const doc = await notifications.findOne({ _id: result.insertedId });
  return res.status(201).json(normalizeDocument(doc));
});

app.put('/notifications/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { read } = req.body;
  const result = await notifications.findOneAndUpdate(
    { _id: toObjectId(id), user_id: req.userId },
    { $set: { read: Boolean(read) } },
    { returnDocument: 'after' }
  );
  if (!result.value) {
    return res.status(404).json({ message: 'Notificação não encontrada.' });
  }
  return res.json(normalizeDocument(result.value));
});

app.listen(port, () => {
  console.log(`Servidor MongoDB rodando em http://localhost:${port}`);
});
