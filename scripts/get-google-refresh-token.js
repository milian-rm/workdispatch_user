// scripts/get-google-refresh-token.js
//
// Script de USO ÚNICO para obtener un refresh_token de OAuth2 de Google,
// necesario para que la app pueda crear eventos de Calendar / Google Meet
// en nombre de una cuenta de Google real (no un service account).
//
// USO:
//   1. Asegúrate de tener en tu .env:
//        GOOGLE_OAUTH_CLIENT_ID=...
//        GOOGLE_OAUTH_CLIENT_SECRET=...
//   2. Corre: node scripts/get-google-refresh-token.js
//   3. Abre en el navegador la URL que imprime en consola.
//   4. Inicia sesión con la cuenta que agregaste como "test user" en
//      Google Auth Platform > Audience.
//   5. Acepta los permisos. Serás redirigido a localhost:3000, y el
//      script imprimirá tu refresh_token en la terminal.
//   6. Copia ese refresh_token a tu .env como GOOGLE_OAUTH_REFRESH_TOKEN.
//   7. Puedes borrar/ignorar este script después (o dejarlo por si
//      necesitas repetir el proceso en el futuro).

import 'dotenv/config';
import { google } from 'googleapis';
import http from 'http';
import { URL } from 'url';

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    REDIRECT_URI
);

// access_type: 'offline' es lo que hace que Google nos dé un refresh_token
// (si no, solo te da un access_token que expira en 1 hora).
// prompt: 'consent' fuerza a que Google muestre la pantalla de permisos
// siempre, incluso si ya autorizaste antes (si no, a veces no regresa
// el refresh_token en autorizaciones repetidas).
const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar']
});

console.log('\n1) Abre esta URL en tu navegador y autoriza con la cuenta correcta:\n');
console.log(authUrl);
console.log('\n2) Esperando la redirección en http://localhost:3000 ...\n');

const server = http.createServer(async (req, res) => {
    try {
        const reqUrl = new URL(req.url, `http://localhost:${PORT}`);

        if (reqUrl.pathname !== '/oauth2callback') {
            res.writeHead(404);
            res.end();
            return;
        }

        const code = reqUrl.searchParams.get('code');
        const error = reqUrl.searchParams.get('error');

        if (error) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end(`Autorización cancelada o fallida: ${error}`);
            console.error('\n❌ Google devolvió un error:', error);
            server.close();
            process.exit(1);
        }

        if (!code) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('No llegó el parámetro "code" en la redirección.');
            return;
        }

        const { tokens } = await oauth2Client.getToken(code);

        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('¡Listo! Ya puedes cerrar esta pestaña y volver a la terminal.');

        console.log('✅ Autorización exitosa.\n');

        if (tokens.refresh_token) {
            console.log('Copia esto a tu .env como GOOGLE_OAUTH_REFRESH_TOKEN:\n');
            console.log(tokens.refresh_token);
            console.log();
        } else {
            console.warn(
                '⚠️  Google no devolvió un refresh_token. Esto pasa si esta cuenta ya\n' +
                '   había autorizado la app antes. Ve a myaccount.google.com/permissions,\n' +
                '   revoca el acceso a esta app, y vuelve a correr este script.'
            );
        }

        server.close();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Error al intercambiar el code por tokens:', err.message);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Ocurrió un error, revisa la terminal.');
        server.close();
        process.exit(1);
    }
});

server.listen(PORT);
