import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini (Web needs access too, or we duplicate logic. 
// For a monolith, duplicating initialization is fine for now).
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json([]);

  try {
    // 1. Get Embedding for Query
    let queryEmbedding: number[] = [];
    
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(query);
      queryEmbedding = result.embedding.values;
    } else {
      // Fallback for Mock
      return NextResponse.json([]); 
    }

    // 2. Fetch all entities (In Production, use pgvector)
    const entities = await prisma.entity.findMany({
      select: { id: true, title: true, type: true, embedding: true }
    });

    // 3. Rank by Similarity
    const results = entities
        .map((entity: any) => {
        if (!entity.embedding) return null;
        try {
          const vector = JSON.parse(entity.embedding);
          if (!Array.isArray(vector)) return null;
          
          const score = cosineSimilarity(queryEmbedding, vector);
          return { ...entity, score };
        } catch {
          return null;
        }
      })
      .filter((e: any) => e !== null)
      .sort((a: any, b: any) => b.score - a.score) // Descending
      .slice(0, 10); // Top 10

    return NextResponse.json(results);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
