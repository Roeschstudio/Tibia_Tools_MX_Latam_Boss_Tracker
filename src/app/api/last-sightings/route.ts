import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Leer el archivo JSON de últimos avistamientos
    const filePath = path.join(process.cwd(), 'src/data/last-sightings.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Devolver los datos como JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading last sightings data:', error);
    return NextResponse.json(
      { error: 'Error al cargar los datos de últimos avistamientos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { bossName, world, timestamp } = await request.json();
    
    // Validar los datos recibidos
    if (!bossName || !world || !timestamp) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos (bossName, world, timestamp)' },
        { status: 400 }
      );
    }
    
    // Leer el archivo existente
    const filePath = path.join(process.cwd(), 'src/data/last-sightings.json');
    let data: Record<string, { world: string; lastSeen: string; updatedAt: string }> = {};
    
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      data = JSON.parse(fileContents);
    }
    
    // Actualizar o agregar el avistamiento para este boss
    data[bossName] = {
      world,
      lastSeen: timestamp,
      updatedAt: new Date().toISOString()
    };
    
    // Guardar los cambios en el archivo
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating last sightings data:', error);
    return NextResponse.json(
      { error: 'Error al actualizar los datos de últimos avistamientos' },
      { status: 500 }
    );
  }
}