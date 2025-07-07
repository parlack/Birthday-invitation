# 🎉 Invitación de Cumpleaños - Proyecto Reorganizado

Una invitación digital interactiva y moderna para celebrar los 20 años de Andrés, con temática espacial, minijuego incluido y sistema de confirmación de asistencia.

## 📁 Estructura del Proyecto

```
Birthday-invitation/
├── 📁 config/              # Configuración
│   └── config.php          # Configuración de base de datos
├── 📁 public/              # Archivos públicos principales
│   ├── index.php           # Página principal de invitación
│   └── rsvp.php            # Procesamiento de confirmaciones
├── 📁 admin/               # Panel de administración
│   ├── admin.php           # Panel principal de administración
│   ├── admin_login.php     # Login de administrador
│   ├── add_guest.php       # Agregar invitados
│   └── visitor_logs.php    # Logs de visitantes
├── 📁 api/                 # Endpoints de API
│   ├── rsvp_ajax.php       # API para confirmaciones RSVP
│   ├── save_score.php      # API para guardar puntuaciones
│   └── get_leaderboard.php # API para obtener ranking
├── 📁 assets/              # Recursos estáticos
│   ├── 📁 css/
│   │   └── styles.css      # Estilos principales
│   ├── 📁 js/
│   │   ├── script.js       # JavaScript principal
│   │   └── game.js         # Lógica del minijuego
│   └── 📁 images/          # Imágenes (vacía por ahora)
├── 📁 database/            # Base de datos
│   ├── database.sql        # Estructura de la base de datos
│   └── fix_rsvp_table.php  # Script de reparación
├── 📁 docs/                # Documentación
│   ├── README.md           # Documentación completa
│   └── LICENSE             # Licencia del proyecto
├── index.php               # Redirección a public/
└── .htaccess              # Configuración del servidor
```

## 🚀 Beneficios de la Nueva Estructura

### ✅ **Mejor Organización**
- **Separación clara**: Cada tipo de archivo tiene su lugar específico
- **Fácil mantenimiento**: Es más fácil encontrar y modificar archivos
- **Escalabilidad**: La estructura permite agregar nuevas funcionalidades fácilmente

### ✅ **Seguridad Mejorada**
- **Configuración protegida**: Los archivos de configuración están separados
- **API organizada**: Los endpoints están en una carpeta específica
- **Acceso controlado**: Mejor control de acceso a diferentes partes del sistema

### ✅ **Desarrollo Más Eficiente**
- **Modularidad**: Cada componente tiene su responsabilidad específica
- **Reutilización**: Los assets se pueden reutilizar fácilmente
- **Debugging**: Es más fácil identificar problemas por área

## 🛠️ Acceso a las Diferentes Secciones

### 👥 **Para Invitados**
- **Invitación principal**: `tudominio.com/` o `tudominio.com/nombre-invitado`
- **Confirmación directa**: `tudominio.com/public/rsvp.php`

### 👨‍💼 **Para Administradores**
- **Panel de administración**: `tudominio.com/admin/admin.php`
- **Login**: `tudominio.com/admin/admin_login.php`
- **Logs de visitantes**: `tudominio.com/admin/visitor_logs.php`

### 🔧 **APIs (para desarrollo)**
- **RSVP**: `tudominio.com/api/rsvp_ajax.php`
- **Puntuaciones**: `tudominio.com/api/save_score.php`
- **Ranking**: `tudominio.com/api/get_leaderboard.php`

## 📋 Instalación y Configuración

1. **Configurar la base de datos**:
   ```bash
   mysql -u root -p < database/database.sql
   ```

2. **Configurar credenciales**:
   Editar `config/config.php` con tus credenciales de MySQL

3. **Configurar el servidor web**:
   Asegúrate de que el archivo `.htaccess` esté funcionando correctamente

## 🎮 Características Principales

- **Invitación Personalizada**: Cada invitado recibe una URL única
- **Sistema RSVP**: Confirmación de asistencia con 3 opciones
- **Minijuego Espacial**: Juego interactivo con ranking
- **Panel de Administración**: Gestión completa de invitados
- **Diseño Responsivo**: Optimizado para todos los dispositivos

## 🔧 Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+, MySQL
- **Seguridad**: PDO, Headers de seguridad
- **Animaciones**: AOS, Canvas API, CSS3
