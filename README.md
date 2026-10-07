# Las Constelaciones · V3.0.0 🌌

**Las Constelaciones** es una PWA para realizar experiencias de constelación dentro del teléfono: construir un campo, colocar representantes, observar posiciones y orientaciones, moverlos con los dedos, registrar percepciones, comparar el inicio con el recorrido y conservar la sesión completa.

## Núcleo de V3

- **Campo interactivo táctil**: arrastrar representantes y girarlos directamente con el dedo; los botones de ±15° siguen disponibles para ajuste fino.
- **INICIO · MOVIMIENTOS · AHORA**: compara la configuración inicial, visualiza trayectorias y superpone el inicio como capa fantasma sobre el campo actual.
- **Cuatro formas de trabajo**: Campo digital, Personas, Objetos y Visualización guiada.
- **Seis corrientes diferenciadas** además de la perspectiva integrada: Hellinger clásica, Movimientos del Alma / Hellinger espiritual, sistémica contemporánea, estructural, energética/espiritual y chamánica/ancestral.
- **Preparador del Campo** con recursos opcionales según la corriente: enraizamiento, silencio, Órdenes del Amor, movimiento emergente, Madre Tierra, ancestros, oración, tambor y otros recursos simbólicos.
- **Percepción representativa**: registra sensaciones corporales, emociones, impulsos, palabras o imágenes asociadas a cada representante sin obligar una interpretación cerrada.
- **Frases sistémicas opcionales**: puedes marcar “Me mueve”, “No siento nada”, “No es para mí”, “Quiero cambiarla” o “Prefiero silencio”.
- **Cuatro formas de cierre**: resolución, suficiente por hoy, dejar abierta o cerrar/interrumpir ahora.
- **Integración e historial**: conserva intención, representantes, configuración inicial, movimientos, percepciones, frases, cierre e integración.

## Biblioteca conservada

V3 mantiene el motor y el contenido de V2.1.0:

- 7 modalidades principales.
- 98 prácticas semilla.
- 106 temas del atlas offline.
- 573 representantes organizados por familias semánticas.
- Constructor personalizado.
- Genograma / mapa familiar.
- Laboratorio de campo.
- Voz/TTS y paisajes sonoros.
- Cuatro mundos visuales: Bosque Elemental, Tierra Galáctica, Océano Galáctico e Infierno Galáctico.
- Gemini opcional: la aplicación funciona sin IA conectada.
- Persistencia local, importación/exportación y cifrado local opcional.

## Compatibilidad

Se conservan los namespaces históricos de almacenamiento:

- `la-constelacion-soy-yo.*`
- `campo.*`
- `mi-campo.*`

Esto permite migrar datos guardados por versiones anteriores sin cambiar las claves que ya existen en el navegador.

## Ejecutar localmente

La aplicación no necesita compilación.

```bash
python -m http.server 8080
```

Abre `http://localhost:8080`.

Para verificar el código:

```bash
npm test
npm run check
```

No hay dependencias npm obligatorias para ejecutar la app.

## Publicar en GitHub Pages

1. Sube el contenido de esta carpeta a la rama `main` de un repositorio.
2. En GitHub abre **Settings → Pages**.
3. En **Build and deployment → Source** selecciona **GitHub Actions**.
4. El workflow incluido en `.github/workflows/deploy-pages.yml` ejecuta las pruebas y publica la app.

El manifest y el service worker usan rutas relativas, por lo que funcionan tanto en un dominio raíz como dentro del subdirectorio habitual de GitHub Pages (`usuario.github.io/repositorio/`).

## iPhone / PWA

En Safari abre la URL publicada y usa **Compartir → Añadir a pantalla de inicio**. La app incluye manifest, iconos y caché offline del shell principal.

## Privacidad e IA

Las sesiones permanecen en el navegador salvo que el usuario exporte datos o utilice de forma explícita una integración externa. Gemini es opcional. No coloques claves privadas en el JavaScript público del repositorio; una integración con clave debe resolverse mediante un backend o variable segura del entorno de despliegue.
