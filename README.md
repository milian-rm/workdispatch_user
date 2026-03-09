# 👥 WorkDispatch User - API de Gestión de Usuarios

API RESTful para la gestión administrativa de usuarios y perfiles en la plataforma **WorkDispatch**. Sistema completo de autenticación, registro y administración de datos de usuarios con roles y permisos.

---

## 📝 Descripción

Servicio backend que proporciona endpoints para que los administradores gestionen usuarios, controlen perfiles, procesen registros y administren accesos y permisos en la plataforma WorkDispatch.

Incluye un sistema de autenticación robusto para validar accesos administrativos y de usuarios finales.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+ (ESM)  
- **Framework:** Express 4.x  
- **Base de Datos:** MongoDB 6.0+  
- **ODM:** Mongoose 8.x  
- **Validación:** express-validator  
- **Seguridad:** Helmet, CORS, Rate Limiting  
- **Gestión de Paquetes:** pnpm / npm

---

## 🚀 Instalación

```bash
# Desde la raíz del proyecto
pnpm install

# Instalar dependencias específicas
pnpm install express mongoose dotenv cors morgan helmet express-validator
```

---

## ⚙️ Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
# Server
NODE_ENV=development
PORT=3001

# MongoDB
URI_MONGODB=mongodb://localhost:27017/workdispatch_user

# Seguridad
JWT_SECRET=tu_secret_key_aqui
JWT_EXPIRE=24h

# Email (Opcional para notificaciones)
EMAIL_SERVICE=gmail
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=tu_password_app

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 📂 Estructura del Proyecto

```
workdispatch_user/
├── configs/            # Configuración principal (App, DB, CORS)
├── src/                # Código fuente de la API
│   ├── Auth/           # Registro y Login
│   ├── User/           # Gestión de Usuarios
│   ├── Profile/        # Perfiles de Usuario
│   ├── Role/           # Roles y Permisos
│   └── Department/     # Departamentos
├── middlewares/        # Validadores y manejadores de errores
├── models/             # Esquemas de MongoDB
├── controllers/        # Lógica de negocio
├── routes/             # Definición de endpoints
└── index.js            # Punto de entrada de la aplicación
```

---

# 🔌 Endpoints Principales

---

## 🔐 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|------------|
| POST | `/workDispatch/v1/auth/register` | Registrar nuevo usuario |
| POST | `/workDispatch/v1/auth/login` | Iniciar sesión |
| POST | `/workDispatch/v1/auth/logout` | Cerrar sesión |
| POST | `/workDispatch/v1/auth/refresh-token` | Renovar token JWT |
| POST | `/workDispatch/v1/auth/forgot-password` | Solicitar recuperación de contraseña |
| PUT | `/workDispatch/v1/auth/reset-password` | Restablecer contraseña |

---

## 👤 Usuarios

| Método | Endpoint | Descripción |
|--------|----------|------------|
| GET | `/workDispatch/v1/users` | Listar todos los usuarios |
| GET | `/workDispatch/v1/users/:id` | Obtener detalle de un usuario |
| POST | `/workDispatch/v1/users` | Crear nuevo usuario (Solo Admin) |
| PUT | `/workDispatch/v1/users/:id` | Actualizar datos de usuario |
| PUT | `/workDispatch/v1/users/:id/status` | Activar o Desactivar usuario |
| DELETE | `/workDispatch/v1/users/:id` | Eliminar usuario (Solo Admin) |

---

## 📋 Perfiles de Usuario

| Método | Endpoint | Descripción |
|--------|----------|------------|
| GET | `/workDispatch/v1/profiles` | Listar todos los perfiles |
| GET | `/workDispatch/v1/profiles/:userId` | Obtener perfil de usuario |
| POST | `/workDispatch/v1/profiles` | Crear nuevo perfil |
| PUT | `/workDispatch/v1/profiles/:id` | Actualizar perfil |
| PUT | `/workDispatch/v1/profiles/:id/avatar` | Cambiar foto de perfil |

---

## 🔑 Roles y Permisos

| Método | Endpoint | Descripción |
|--------|----------|------------|
| GET | `/workDispatch/v1/roles` | Listar todos los roles |
| GET | `/workDispatch/v1/roles/:id` | Obtener detalle de rol |
| POST | `/workDispatch/v1/roles` | Crear nuevo rol (Solo Admin) |
| PUT | `/workDispatch/v1/roles/:id` | Actualizar rol |
| PUT | `/workDispatch/v1/users/:id/role` | Asignar rol a usuario |

---

## 🏢 Departamentos

| Método | Endpoint | Descripción |
|--------|----------|------------|
| GET | `/workDispatch/v1/departments` | Listar departamentos |
| GET | `/workDispatch/v1/departments/:id` | Obtener detalle de departamento |
| POST | `/workDispatch/v1/departments` | Crear departamento (Solo Admin) |
| PUT | `/workDispatch/v1/departments/:id` | Actualizar departamento |
| PUT | `/workDispatch/v1/users/:id/department` | Asignar usuario a departamento |

---

## 📊 Actividad y Auditoría

| Método | Endpoint | Descripción |
|--------|----------|------------|
| GET | `/workDispatch/v1/activity-log` | Ver registro de actividades |
| GET | `/workDispatch/v1/activity-log/:userId` | Actividades de un usuario |
| GET | `/workDispatch/v1/audit-trail` | Rastro de auditoría completo |

---

# 📊 Ejemplos de Petición (JSON)

Aquí encontrarás los cuerpos JSON (Body) necesarios para probar cada entidad en Postman.

---

## 🔐 1. Auth (Registro y Login)

### Registrar Nuevo Usuario

**POST**  
`http://localhost:3001/workDispatch/v1/auth/register`

```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@workdispatch.com",
  "password": "SecurePassword123!",
  "phone": "+502 7845 1234",
  "role": "USER"
}
```

---

### Iniciar Sesión

**POST**  
`http://localhost:3001/workDispatch/v1/auth/login`

```json
{
  "email": "juan.perez@workdispatch.com",
  "password": "SecurePassword123!"
}
```

---

### Recuperar Contraseña

**POST**  
`http://localhost:3001/workDispatch/v1/auth/forgot-password`

```json
{
  "email": "juan.perez@workdispatch.com"
}
```

---

### Restablecer Contraseña

**PUT**  
`http://localhost:3001/workDispatch/v1/auth/reset-password`

```json
{
  "token": "token_recuperacion_desde_email",
  "newPassword": "NuevaPassword456!"
}
```

---

## 👤 2. Usuario (Gestión)

### Crear Usuario (Solo Admin)

**POST**  
`http://localhost:3001/workDispatch/v1/users`

```json
{
  "firstName": "Carlos",
  "lastName": "González",
  "email": "carlos.gonzalez@workdispatch.com",
  "password": "TempPassword123!",
  "phone": "+502 7945 5678",
  "department": "VENTAS",
  "role": "SUPERVISOR",
  "hireDate": "2026-03-01"
}
```

---

### Actualizar Perfil de Usuario

**PUT**  
`http://localhost:3001/workDispatch/v1/users/ID_DEL_USUARIO`

```json
{
  "firstName": "Carlos Alejandro",
  "lastName": "González García",
  "phone": "+502 7999 9999",
  "bio": "Supervisor de Ventas con 5 años de experiencia",
  "location": "Ciudad de Guatemala"
}
```

---

### Cambiar Estado de Usuario

**PUT**  
`http://localhost:3001/workDispatch/v1/users/ID_DEL_USUARIO/status`

```json
{
  "status": "ACTIVE",
  "reason": "Usuario reactivado tras validación"
}
```

---

### Asignar Rol a Usuario

**PUT**  
`http://localhost:3001/workDispatch/v1/users/ID_DEL_USUARIO/role`

```json
{
  "role": "ADMIN",
  "assignedBy": "ID_ADMIN_ACTUAL"
}
```

---

## 📋 3. Perfil de Usuario

### Crear Perfil

**POST**  
`http://localhost:3001/workDispatch/v1/profiles`

```json
{
  "userId": "ID_DEL_USUARIO",
  "avatar": "https://api.example.com/avatars/carlos.jpg",
  "bio": "Especialista en gestión de proyectos",
  "skills": ["Liderazgo", "Excel", "Project Management"],
  "languages": ["Español", "Inglés"],
  "timezone": "America/Guatemala"
}
```

---

### Actualizar Perfil

**PUT**  
`http://localhost:3001/workDispatch/v1/profiles/ID_PERFIL`

```json
{
  "bio": "Actualización de bio profesional",
  "skills": ["Liderazgo", "Excel", "Project Management", "Comunicación"],
  "languages": ["Español", "Inglés", "Francés"],
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/carlosgonzalez",
    "github": "https://github.com/carlosgonzalez"
  }
}
```

---

### Cambiar Foto de Perfil

**PUT**  
`http://localhost:3001/workDispatch/v1/profiles/ID_PERFIL/avatar`

```json
{
  "avatar": "https://cloudinary.example.com/uploads/profile_carlos_v2.jpg"
}
```

---

## 🔑 4. Roles y Permisos

### Crear Nuevo Rol

**POST**  
`http://localhost:3001/workDispatch/v1/roles`

```json
{
  "name": "GESTOR_PROYECTOS",
  "description": "Gestor de proyectos con permisos de lectura y edición",
  "permissions": [
    "projects.view",
    "projects.create",
    "projects.edit",
    "projects.delete_own",
    "users.view"
  ],
  "level": 2
}
```

---

### Asignar Rol a Usuario

**PUT**  
`http://localhost:3001/workDispatch/v1/users/ID_USUARIO/role`

```json
{
  "role": "GESTOR_PROYECTOS",
  "effectiveDate": "2026-03-09"
}
```

---

## 🏢 5. Departamentos

### Crear Departamento

**POST**  
`http://localhost:3001/workDispatch/v1/departments`

```json
{
  "name": "Ventas",
  "code": "VENTAS",
  "description": "Departamento encargado de ventas y relaciones con clientes",
  "manager": "ID_GERENTE",
  "budget": 50000.00,
  "location": "Piso 3, Zona 10"
}
```

---

### Actualizar Departamento

**PUT**  
`http://localhost:3001/workDispatch/v1/departments/ID_DEPARTAMENTO`

```json
{
  "name": "Ventas y Marketing",
  "description": "Departamento integrado de Ventas y Marketing",
  "manager": "ID_NUEVO_GERENTE",
  "budget": 75000.00
}
```

---

### Asignar Usuario a Departamento

**PUT**  
`http://localhost:3001/workDispatch/v1/users/ID_USUARIO/department`

```json
{
  "department": "ID_DEPARTAMENTO",
  "position": "Ejecutivo de Ventas",
  "startDate": "2026-03-09"
}
```

---

## 📊 6. Actividad y Auditoría

### Ver Registro de Actividades

**GET**  
`http://localhost:3001/workDispatch/v1/activity-log?limit=20&page=1&userId=ID_USUARIO`

---

### Ver Rastro de Auditoría

**GET**  
`http://localhost:3001/workDispatch/v1/audit-trail?action=CREATE&entity=User&dateFrom=2026-03-01`

---

# 🗄️ Modelos de Base de Datos (Esquemas)

---

## 👤 Usuario (User)

Representa a los usuarios y empleados de la plataforma WorkDispatch.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|------------|
| firstName | String | ✅ | Nombre del usuario (Máx 50 caracteres) |
| lastName | String | ✅ | Apellido del usuario (Máx 50 caracteres) |
| email | String | ✅ | Correo electrónico único para acceso |
| password | String | ✅ | Contraseña encriptada (bcrypt) |
| phone | String | ❌ | Número telefónico del usuario |
| role | ObjectId | ✅ | Referencia al modelo Role |
| department | ObjectId | ❌ | Referencia al modelo Department |
| status | String | ❌ | Estado: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] (Default: 'ACTIVE') |
| lastLogin | Date | ❌ | Fecha del último acceso |
| createdAt | Date | ✅ | Fecha de creación (Auto) |
| updatedAt | Date | ✅ | Fecha de última modificación (Auto) |

---

## 📋 Perfil (Profile)

Información adicional y extensible del usuario.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|------------|
| userId | ObjectId | ✅ | Referencia al modelo User (Único) |
| avatar | String | ❌ | URL de foto de perfil |
| bio | String | ❌ | Biografía profesional (Máx 500 caracteres) |
| skills | Array | ❌ | Array de habilidades del usuario |
| languages | Array | ❌ | Idiomas que habla |
| timezone | String | ❌ | Zona horaria del usuario |
| socialLinks | Object | ❌ | Enlaces a redes sociales (LinkedIn, GitHub, etc.) |
| isPublic | Boolean | ❌ | Si el perfil es público (Default: false) |

---

## 🔑 Rol (Role)

Define permisos y niveles de acceso.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|------------|
| name | String | ✅ | Nombre del rol (Único) |
| description | String | ✅ | Descripción detallada |
| permissions | Array | ✅ | Array de permisos (ej: 'users.view', 'users.create') |
| level | Number | ✅ | Nivel jerárquico (1=Bajo, 5=Alto) |
| isActive | Boolean | ❌ | Si el rol está activo (Default: true) |
| createdAt | Date | ✅ | Fecha de creación (Auto) |

---

## 🏢 Departamento (Department)

Estructura organizacional de la empresa.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|------------|
| name | String | ✅ | Nombre del departamento |
| code | String | ✅ | Código único del departamento |
| description | String | ❌ | Descripción del departamento |
| manager | ObjectId | ❌ | Referencia al usuario gerente |
| budget | Number | ❌ | Presupuesto anual asignado |
| location | String | ❌ | Ubicación física o virtual |
| memberCount | Number | ❌ | Cantidad de empleados (Calculado) |
| isActive | Boolean | ❌ | Estado del departamento (Default: true) |

---

## 📝 Asignación de Usuario (UserAssignment)

Registro de departamento y posición actual del usuario.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|------------|
| userId | ObjectId | ✅ | Referencia al modelo User |
| department | ObjectId | ✅ | Referencia al modelo Department |
| position | String | ✅ | Cargo o posición en el departamento |
| startDate | Date | ✅ | Fecha de asignación |
| endDate | Date | ❌ | Fecha de término (Si aplica) |
| isCurrent | Boolean | ❌ | Si es la asignación actual (Default: true) |

---

## 📊 Registro de Actividad (ActivityLog)

Auditoría de acciones de usuarios.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|------------|
| userId | ObjectId | ✅ | Usuario que realizó la acción |
| action | String | ✅ | Tipo de acción (LOGIN, CREATE, UPDATE, DELETE) |
| entity | String | ✅ | Entidad afectada (User, Profile, Department) |
| entityId | ObjectId | ❌ | ID del recurso modificado |
| details | Object | ❌ | Detalles adicionales de la acción |
| ipAddress | String | ❌ | IP desde la que se realizó la acción |
| userAgent | String | ��� | Navegador/cliente utilizado |
| timestamp | Date | ✅ | Fecha y hora de la acción |

---

## 🔐 Token de Reseteo (PasswordReset)

Tokens temporales para recuperación de contraseña.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|------------|
| userId | ObjectId | ✅ | Referencia al usuario |
| token | String | ✅ | Token único y seguro |
| expiresAt | Date | ✅ | Fecha de expiración (24 horas) |
| used | Boolean | ❌ | Si el token ya fue utilizado (Default: false) |
| createdAt | Date | ✅ | Fecha de creación |

---

# 🛠️ Scripts Disponibles

```bash
# Instalar dependencias
pnpm install

# Iniciar el servidor en modo desarrollo con nodemon
pnpm run dev

# Iniciar el servidor de forma normal
pnpm start

# Ejecutar tests (si aplica)
pnpm run test

# Linting y validación de código
pnpm run lint

# Build para producción
pnpm run build
```

---

# 📚 Documentación Adicional

- **API Documentation:** Se recomienda usar Swagger/OpenAPI para documentación interactiva
- **Postman Collection:** [Descargar](https://www.postman.com/)
- **Contribuir:** Por favor lee CONTRIBUTING.md antes de hacer pull requests

---

## ✅ Checklist de Implementación

- [ ] Endpoints de autenticación (Register, Login, Logout)
- [ ] Gestión completa de usuarios (CRUD)
- [ ] Sistema de roles y permisos
- [ ] Perfiles de usuario
- [ ] Gestión de departamentos
- [ ] Registro de actividades/auditoría
- [ ] Validación de entrada con express-validator
- [ ] Manejo de errores centralizado
- [ ] Variables de entorno configuradas
- [ ] Tests unitarios e integración
- [ ] Documentación en Swagger
- [ ] Deployment en producción

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👨‍💼 Autor

**milian-rm** - Desarrollador Backend  
GitHub: [@milian-rm](https://github.com/milian-rm)

---

## 📞 Soporte

Para reportar bugs o solicitar features, abre un [issue](https://github.com/milian-rm/workdispatch_user/issues) en el repositorio.

---

**Última actualización:** 2026-03-09 | **Versión:** 1.0.0
