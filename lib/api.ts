import {
  Food,
  Sale,
  PixConfig,
  User,
  Event,
  Comment,
  Category,
  Location,
  Organizer,
  Participation,
  Rating,
  Notification,
  Tag,
} from '../types';

const baseUrl = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('app_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || response.statusText || 'Erro na requisição');
  }

  return data;
}

export async function getCurrentUser() {
  return request<{ user: User }>('/auth/me');
}

export async function signUp(email: string, password: string, username: string) {
  return request<{ token: string; user: User }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  });
}

export async function signIn(email: string, password: string) {
  return request<{ token: string; user: User }>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function signOut() {
  localStorage.removeItem('app_token');
}

export async function fetchFoods() {
  return request<Food[]>('/foods');
}

export async function createFood(data: { name: string; price: number; image_url: string | null; display_order: number }) {
  return request<Food>('/foods', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFood(id: string, data: { name: string; price: number; image_url: string | null }) {
  return request<Food>(`/foods/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFood(id: string) {
  return request<{ success: boolean }>(`/foods/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchSales() {
  return request<Sale[]>('/sales');
}

export async function createSale(data: { food_id: string; payment_method: string }) {
  return request<Sale>('/sales', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPixConfig() {
  return request<PixConfig | null>('/pix');
}

export async function createPixConfig(data: { pixKey: string; merchantName: string }) {
  return request<PixConfig>('/pix', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePixConfig(id: string, data: { pixKey: string; merchantName: string }) {
  return request<PixConfig>(`/pix/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function fetchUsers() {
  return request<User[]>('/users');
}

export async function fetchEvents(query: { category_id?: string; organizer_id?: string; tag_id?: string } = {}) {
  const params = new URLSearchParams(query as Record<string, string>);
  return request<Event[]>(`/events?${params.toString()}`);
}

export async function createEvent(data: Omit<Event, 'id' | 'created_at'>) {
  return request<Event>('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEvent(id: string, data: Omit<Event, 'id' | 'created_at'>) {
  return request<Event>(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id: string) {
  return request<{ success: boolean }>(`/events/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchCategories() {
  return request<Category[]>('/categories');
}

export async function createCategory(data: { name: string; description?: string }) {
  return request<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: string, data: { name: string; description?: string }) {
  return request<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string) {
  return request<{ success: boolean }>(`/categories/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchTags() {
  return request<Tag[]>('/tags');
}

export async function createTag(data: { name: string }) {
  return request<Tag>('/tags', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTag(id: string, data: { name: string }) {
  return request<Tag>(`/tags/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTag(id: string) {
  return request<{ success: boolean }>(`/tags/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchLocations() {
  return request<Location[]>('/locations');
}

export async function createLocation(data: { name: string; address: string; city: string; state: string; zip_code: string }) {
  return request<Location>('/locations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLocation(id: string, data: { name: string; address: string; city: string; state: string; zip_code: string }) {
  return request<Location>(`/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteLocation(id: string) {
  return request<{ success: boolean }>(`/locations/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchOrganizers() {
  return request<Organizer[]>('/organizers');
}

export async function createOrganizer(data: { user_id: string; organization_name?: string; bio?: string; website?: string }) {
  return request<Organizer>('/organizers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOrganizer(id: string, data: { organization_name?: string; bio?: string; website?: string }) {
  return request<Organizer>(`/organizers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteOrganizer(id: string) {
  return request<{ success: boolean }>(`/organizers/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchComments(eventId?: string) {
  const params = eventId ? `?event_id=${encodeURIComponent(eventId)}` : '';
  return request<Comment[]>(`/comments${params}`);
}

export async function createComment(data: { event_id: string; user_id: string; content: string }) {
  return request<Comment>('/comments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchParticipations(eventId?: string) {
  const params = eventId ? `?event_id=${encodeURIComponent(eventId)}` : '';
  return request<Participation[]>(`/participations${params}`);
}

export async function createParticipation(data: { event_id: string; user_id: string; status: string }) {
  return request<Participation>('/participations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateParticipation(id: string, data: { status: string }) {
  return request<Participation>(`/participations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteParticipation(id: string) {
  return request<{ success: boolean }>(`/participations/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchRatings(eventId?: string) {
  const params = eventId ? `?event_id=${encodeURIComponent(eventId)}` : '';
  return request<Rating[]>(`/ratings${params}`);
}

export async function createRating(data: { event_id: string; user_id: string; score: number; comment?: string }) {
  return request<Rating>('/ratings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchNotifications() {
  return request<Notification[]>('/notifications');
}

export async function createNotification(data: { user_id: string; title: string; message: string }) {
  return request<Notification>('/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function markNotificationRead(id: string, read: boolean) {
  return request<Notification>(`/notifications/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ read }),
  });
}
