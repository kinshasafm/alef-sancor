# Monumental interactivo

Imagen del estadio con marcas clickeables; cada marca abre un video en un modal.
Sitio estático (HTML, CSS y JS sin build) publicado con GitHub Pages.

## Probar localmente

```bash
python -m http.server 8000
```

Abrir <http://localhost:8000>. Hace falta un servidor: abriendo `index.html` directo no carga `data/videos.json`.

## Agregar un video nuevo

1. Nombrarlo sin espacios, acentos ni mayúsculas (por ejemplo `nuevo-video.mp4`).
2. Verificar que sea H.264 + AAC y aplicarle faststart:
   ```bash
   ffprobe -v error -show_entries stream=codec_name -of csv=p=0 original.mp4
   ffmpeg -i original.mp4 -map 0:v:0 -map 0:a:0 -c copy -movflags +faststart videos/nuevo-video.mp4
   ```
   Si no es H.264/AAC, reemplazar `-c copy` por `-c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k`.
3. Generar el poster con el mismo nombre en `img/posters/`:
   ```bash
   ffmpeg -ss 1 -i videos/nuevo-video.mp4 -frames:v 1 -vf "scale='min(720,iw)':-2" -q:v 4 img/posters/nuevo-video.jpg
   ```
4. Agregar una entrada en `data/videos.json`:
   ```json
   { "id": "14", "titulo": "Nuevo video", "archivo": "videos/nuevo-video.mp4", "x": 50, "y": 50 }
   ```
5. Ubicar la marca con el modo edición, hacer commit y push.

GitHub rechaza archivos de más de 100 MB; conviene mantener cada video por debajo de 50 MB.

## Modo edición

El modo edición funciona solo en local: los archivos de `editor/` están en `.gitignore`
y nunca se publican, y el sitio solo los carga cuando se sirve desde `localhost`.
En la versión publicada, `?edit=1` no hace nada.

Con el servidor local levantado, abrir `http://localhost:8000/?edit=1`.

- Arrastrar las marcas a su lugar (mouse o dedo). Con una marca enfocada, las flechas la mueven 0,1 % (con Shift, 1 %).
- Hacer clic en la imagen muestra sus coordenadas en porcentaje.
- **Exportar videos.json** copia el JSON con las posiciones nuevas al portapapeles y lo descarga.
- Reemplazar `data/videos.json` con el exportado, hacer commit y push.

Los cambios no se guardan solos: si se recarga la página antes de exportar, se pierden.

## Estructura

```
index.html
css/style.css
js/app.js
data/videos.json     lista de videos y posiciones (x, y en % de la imagen)
img/monumental.jpg
img/posters/         un .jpg por video, con el mismo nombre que el .mp4
videos/
```
