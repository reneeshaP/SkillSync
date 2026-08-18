const EMBEDDING_MODEL = 'gemini-embedding-001';
const GEMINI_EMBEDDINGS_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`;

// Combines a user's skills/bio/experience into one string for embedding
export const buildProfileText = (user) => {
  const parts = [];
  if (user.skills?.length) parts.push(`Skills: ${user.skills.join(', ')}`);
  if (user.bio) parts.push(`Bio: ${user.bio}`);
  if (user.experience) parts.push(`Experience: ${user.experience}`);
  return parts.join('. ');
};

export const getEmbedding = async (text) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  if (!text || !text.trim()) {
    throw new Error('Cannot embed empty text');
  }

  const response = await fetch(`${GEMINI_EMBEDDINGS_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: { parts: [{ text }] },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini embeddings request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.embedding.values;
};

// Recomputes and saves the embedding for a user based on their current profile fields
export const updateUserEmbedding = async (user) => {
  const text = buildProfileText(user);
  if (!text) {
    user.embedding = [];
    await user.save();
    return user;
  }

  const embedding = await getEmbedding(text);
  user.embedding = embedding;
  await user.save();
  return user;
};
