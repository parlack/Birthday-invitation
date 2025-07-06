# 🎉 Invitación de Cumpleaños 

Una invitación digital interactiva y moderna para celebrar los 20 años de Andrés, con temática espacial, minijuego incluido y sistema de confirmación de asistencia.

## 🌟 Características Principales

### ✨ Funcionalidades Interactivas
- **Invitación Personalizada**: Cada invitado recibe una URL única con su nombre
- **Confirmación RSVP**: Sistema de confirmación de asistencia con 3 opciones (Asistir, Tal vez, No asistir)
- **Minijuego Espacial**: Juego interactivo con ranking y competencia entre invitados
- **Cuenta Regresiva**: Contador dinámico hasta el día del evento
- **Diseño Responsivo**: Optimizado para móviles, tablets y desktop
- **Animaciones Modernas**: Efectos visuales con temática espacial

### 🎮 Minijuego Galáctico
- Juego de esquivar asteroides y recolectar elementos
- Sistema de puntuación y ranking global
- Competencia entre invitados
- Efectos visuales y sonoros

### 📊 Panel de Administración
- Gestión completa de invitados
- Visualización de confirmaciones RSVP
- Estadísticas de visitas y dispositivos
- Ranking de puntuaciones del juego

## 🚀 Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica moderna
- **CSS3**: Animaciones, gradientes y efectos visuales
- **JavaScript (ES6+)**: Interactividad y juego
- **Canvas API**: Gráficos del minijuego
- **AOS (Animate On Scroll)**: Animaciones de desplazamiento
- **Font Awesome**: Iconografía
- **Google Fonts**: Tipografías personalizadas

### Backend
- **PHP 7.4+**: Lógica del servidor
- **MySQL**: Base de datos relacional
- **PDO**: Conexión segura a la base de datos
- **AJAX**: Comunicación asíncrona

### Seguridad
- **Prepared Statements**: Prevención de inyección SQL
- **Headers de Seguridad**: Protección XSS y CSRF
- **Validación de Datos**: Sanitización de entradas
- **Autenticación**: Sistema de login para administradores


## 🗄️ Base de Datos

### Tablas Principales

#### `guests`
Almacena información de los invitados
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- name (VARCHAR(255), NOT NULL)
- email (VARCHAR(255))
- invitation_code (VARCHAR(100), UNIQUE, NOT NULL)
- created_at (TIMESTAMP)
```

#### `rsvp`
Confirmaciones de asistencia
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- guest_id (INT, FOREIGN KEY)
- status (ENUM: 'pending', 'confirmed', 'declined', 'unsure')
- updated_at (TIMESTAMP)
```

#### `game_scores`
Puntuaciones del minijuego
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- guest_id (INT, FOREIGN KEY)
- guest_name (VARCHAR(255))
- score (INT)
- created_at (TIMESTAMP)
```

#### `visitor_logs`
Registro de visitas
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- guest_id (INT, FOREIGN KEY)
- ip_address (VARCHAR(45))
- user_agent (VARCHAR(255))
- visit_date (TIMESTAMP)
- visit_count (INT)
- device_type (VARCHAR(50))
- country (VARCHAR(50))
- city (VARCHAR(100))
```

## ⚙️ Instalación y Configuración

### Requisitos Previos
- **Servidor Web**: Apache/Nginx
- **PHP**: 7.4 o superior
- **MySQL**: 5.7 o superior
- **Módulos PHP**: PDO, PDO_MySQL

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/birthday-invitation.git
cd birthday-invitation
```

2. **Configurar la base de datos**
```bash
# Crear la base de datos
mysql -u root -p < database.sql
```

3. **Configurar credenciales**
Editar `config.php` con tus credenciales de MySQL:
```php
$host = 'localhost';
$username = 'tu_usuario';
$password = 'tu_contraseña';
$database = 'birthday_invitation';
```

### Configuración de URLs Amigables

El archivo `.htaccess` permite URLs como:
- `tudominio.com/carlos` → `tudominio.com/index.php?guest=carlos`
- `tudominio.com/maria` → `tudominio.com/index.php?guest=maria`

## 🎯 Uso del Sistema

### Para Invitados

1. **Acceder a la invitación**
   - URL personalizada: `tudominio.com/nombre-invitado`
   - La página carga con el nombre personalizado

2. **Confirmar asistencia**
   - Hacer clic en "¡SÍ!" para confirmar
   - "TAL VEZ" para respuesta incierta
   - "NO PUEDO" para declinar

3. **Jugar el minijuego**
   - Hacer clic en "JUGAR AHORA"
   - Controlar la nave con mouse/touch
   - Esquivar asteroides y recolectar elementos
   - Competir en el ranking global con los demas invitados

### Para Administradores

1. **Acceder al panel**
   - Ir a `tudominio.com/admin.php`
   - Usuario: `usuario`
   - Contraseña: `contraseña`

2. **Gestionar invitados**
   - Ver lista de invitados y sus respuestas
   - Agregar nuevos invitados
   - Generar códigos de invitación únicos

## 🎮 Mecánicas del Juego

### Controles
- **Desktop**: Mover mouse para controlar la nave
- **Móvil**: Tocar y arrastrar en la pantalla

### Objetivos
- Esquivar asteroides rojos
- Evitar rayos láser verticales
- Recolectar elementos azules (+10 puntos)
- Sobrevivir el mayor tiempo posible

### Sistema de Puntuación
- +10 puntos por cada elemento recolectado
- La dificultad aumenta progresivamente
- Solo se guarda la mejor puntuación de cada jugador

## 🔧 Personalización

### Cambiar Información del Evento
Editar en `index.php`:
```php
// Fecha del evento
<div id="countdown" data-event-date="2025-07-12T16:00:00">

// Detalles del evento
<div class="detail">
    <span>12.07.2025</span> // Fecha
</div>
<div class="detail">
    <span>16:00</span> // Hora
</div>
```

### Personalizar Colores
Editar variables CSS en `styles.css`:
```css
:root {
    --primary: #9d4edd;
    --primary-light: #c77dff;
    --primary-dark: #7b2cbf;
    --accent: #10002b;
    --neon-blue: #00d4ff;
    --neon-pink: #ff0080;
}
```

### Configurar Credenciales de Admin
Cambiar en `admin.php`:
```php
$username = "admin";
$password = "tu_contraseña_segura";
```

## 🛡️ Seguridad

### Medidas Implementadas
- **Prepared Statements**: Prevención de SQL injection
- **Headers de Seguridad**: XSS, CSRF, Clickjacking
- **Validación de Datos**: Sanitización de entradas
- **Autenticación**: Login requerido para administración
- **Protección de Archivos**: `.htaccess` protege archivos sensibles

### Recomendaciones Adicionales
- Cambiar credenciales por defecto
- Usar HTTPS en producción
- Implementar rate limiting
- Backup regular de la base de datos
- Actualizar PHP y dependencias

## 📱 Compatibilidad

### Navegadores Soportados
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Opera 47+

### Dispositivos
- **Desktop**: Experiencia completa
- **Tablet**: Optimizado para touch
- **Móvil**: Interfaz adaptativa

## 🐛 Resolución de Problemas

### Problemas Comunes

**Error de conexión a la base de datos**
- Verificar credenciales en `config.php`
- Comprobar que MySQL esté ejecutándose
- Verificar permisos de usuario

**RSVP no se guarda**
- Revisar logs en `rsvp_debug.log`
- Verificar permisos de escritura
- Comprobar estructura de la base de datos

**Juego no carga**
- Verificar que JavaScript esté habilitado
- Comprobar la consola del navegador
- Revisar permisos de archivos

**URLs amigables no funcionan**
- Verificar que mod_rewrite esté habilitado
- Comprobar configuración de `.htaccess`
- Revisar permisos del directorio

## 🔄 Mantenimiento

### Tareas Regulares
- Backup de la base de datos
- Limpiar logs antiguos
- Verificar estadísticas de uso
- Actualizar dependencias

### Comandos Útiles
```bash
# Backup de la base de datos
mysqldump -u usuario -p birthday_invitation > backup.sql

# Verificar logs de errores
tail -f /var/log/apache2/error.log

# Limpiar logs de depuración
rm rsvp_debug.log
```

## 📊 Métricas y Analytics

### Datos Disponibles
- Número total de visitas
- Confirmaciones por estado
- Dispositivos más utilizados
- Mejores puntuaciones del juego
- Patrones de uso por fecha/hora

### Consultas Útiles
```sql
-- Estadísticas RSVP
SELECT status, COUNT(*) as total 
FROM rsvp 
GROUP BY status;

-- Top 10 jugadores
SELECT guest_name, MAX(score) as best_score 
FROM game_scores 
GROUP BY guest_id 
ORDER BY best_score DESC 
LIMIT 10;

-- Visitas por dispositivo
SELECT device_type, COUNT(*) as visits 
FROM visitor_logs 
GROUP BY device_type;
```

## 🤝 Contribuciones

### Cómo Contribuir
1. Fork el repositorio
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Crear un Pull Request

### Estándares de Código
- PHP: PSR-12
- JavaScript: ES6+
- CSS: BEM methodology
- Comentarios en español

## 📝 Changelog

### v1.0.0 (Actual)
- ✅ Invitación personalizada por invitado
- ✅ Sistema RSVP con AJAX
- ✅ Minijuego espacial interactivo
- ✅ Panel de administración completo
- ✅ Diseño responsive
- ✅ Animaciones y efectos visuales
- ✅ Sistema de logging de visitantes
- ✅ Ranking de puntuaciones

## 👨‍💻 Autor

**Desarrollado para la celebración de los 20 años de Andrés**

---

## 🎉 ¡Disfruta la Fiesta!

---
 