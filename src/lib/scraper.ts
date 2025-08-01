import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import * as nodeCron from 'node-cron';
import { LiveBoss } from '@/types/boss';

// Función para obtener los bosses activos de la página de noticias de Tibia
export async function scrapeTibiaBosses(): Promise<LiveBoss[]> {
  try {
    // Obtener el HTML de la página de noticias de Tibia
    const response = await fetch('https://www.tibia.com/news/');
    const html = await response.text();

    // Cargar el HTML en cheerio
    const $ = cheerio.load(html);
    const bosses: LiveBoss[] = [];

    // Cargar la lista de bosses conocidos desde nuestro archivo JSON
    const bossesData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'src/data/respawns.json'), 'utf-8')
    );
    const knownBosses = bossesData.bosses.map((boss: any) => ({
      name: boss.name,
      rarity: boss.rarity,
    }));

    // Buscar noticias que contengan información sobre bosses
    $('.NewsHeadlineText').each((i, element) => {
      const newsText = $(element).text().trim();
      
      // Buscar menciones de bosses conocidos en las noticias
      knownBosses.forEach((boss: { name: string; rarity: string }) => {
        if (newsText.includes(boss.name)) {
          // Extraer información sobre el mundo (server)
          const worldMatch = newsText.match(/in (\w+)\./i);
          const world = worldMatch ? worldMatch[1] : 'Unknown';
          
          // Obtener la fecha y hora de la noticia
          const dateElement = $(element).prev('.NewsHeadlineDate');
          const dateText = dateElement.text().trim();
          
          bosses.push({
            name: boss.name,
            world,
            timestamp: dateText,
            rarity: boss.rarity,
          });
        }
      });
    });

    // Guardar los resultados en un archivo JSON para persistencia
    const dataDir = path.join(process.cwd(), 'src/data');
    const filePath = path.join(dataDir, 'live-bosses.json');
    
    // Asegurarse de que el directorio exista
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify({ bosses, lastUpdated: new Date().toISOString() }, null, 2));
    
    return bosses;
  } catch (error) {
    console.error('Error scraping Tibia bosses:', error);
    return [];
  }
}

// Función para iniciar el cron job que ejecuta el scraper cada 10 minutos
export function startBossScraper() {
  // Ejecutar inmediatamente al iniciar
  scrapeTibiaBosses();
  
  // Programar la ejecución cada 10 minutos
  return nodeCron.schedule('*/10 * * * *', async () => {
    console.log('Running boss scraper...');
    await scrapeTibiaBosses();
    console.log('Boss scraper completed at', new Date().toISOString());
  });
}

// Si este archivo se ejecuta directamente (no se importa), ejecutar el scraper
if (require.main === module) {
  startBossScraper();
}