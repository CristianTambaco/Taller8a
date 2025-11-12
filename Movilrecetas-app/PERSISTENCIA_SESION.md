# Persistencia de Sesión - Cookly App

## 📖 Descripción

Esta implementación permite que los usuarios permanezcan logueados después de cerrar y volver a abrir la aplicación, utilizando AsyncStorage para almacenar de forma segura la información de sesión.

## 🚀 Características

- **Sesión persistente**: Los usuarios permanecen logueados al cerrar y abrir la app
- **Opción "Recordar sesión"**: Los usuarios pueden elegir si desean mantener su sesión activa
- **Almacenamiento seguro**: Utiliza AsyncStorage para React Native
- **Sincronización automática**: La sesión se sincroniza con Supabase Auth
- **Limpieza automática**: Se limpian los datos locales al cerrar sesión

## 🔧 Implementación Técnica

### 1. Configuración de Supabase

```typescript
// src/data/services/supabaseClient.ts
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage, // ✅ Usar AsyncStorage
    autoRefreshToken: true, // ✅ Refrescar token automático
    persistSession: true, // ✅ Persistir sesión
    detectSessionInUrl: false,
  },
});
```

### 2. Gestión en AuthUseCase

```typescript
// Iniciar sesión con opción de recordar
async iniciarSesion(email: string, password: string, recordarSesion: boolean = true) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (data.user && recordarSesion) {
    // Guardar preferencia y datos de usuario
    await StorageService.setItem(StorageService.SESSION_REMEMBER_KEY, "true");
    const usuarioCompleto = await this.obtenerUsuarioActual();
    await StorageService.setObject(StorageService.SESSION_USER_KEY, usuarioCompleto);
  }
}

// Verificar sesión persistente al iniciar app
async verificarSesionPersistente(): Promise<Usuario | null> {
  const recordarSesion = await StorageService.getItem(StorageService.SESSION_REMEMBER_KEY);

  if (recordarSesion === "false") return null;

  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    return await this.obtenerUsuarioActual();
  }

  return null;
}
```

### 3. Hook useAuth

```typescript
// Verificar sesión al iniciar la app
useEffect(() => {
  verificarSesionInicial();

  const { data: subscription } = authUseCase.onAuthStateChange(async (user) => {
    setUsuario(user);

    // Guardar usuario en storage si está activo
    if (user) {
      const recordarSesion = await StorageService.getItem(
        StorageService.SESSION_REMEMBER_KEY
      );
      if (recordarSesion !== "false") {
        await StorageService.setObject(StorageService.SESSION_USER_KEY, user);
      }
    }
  });
}, []);
```

### 4. Pantalla de Login

```tsx
// Estado para la opción "Recordar sesión"
const [recordarSesion, setRecordarSesion] = useState(true);

// Switch para que el usuario elija
<View style={styles.recordarSesionContainer}>
  <Switch
    value={recordarSesion}
    onValueChange={setRecordarSesion}
    trackColor={{ false: colors.border, true: colors.primary }}
  />
  <Text>Recordar sesión</Text>
</View>;

// Pasar la preferencia al login
const resultado = await iniciarSesion(email, password, recordarSesion);
```

## 📱 Flujo de Usuario

### Primera vez:

1. Usuario ingresa email y contraseña
2. Selecciona "Recordar sesión" (activado por defecto)
3. Al hacer login exitoso, se guarda la sesión en AsyncStorage
4. Usuario queda logueado

### Siguientes veces:

1. Usuario abre la app
2. `useAuth` verifica automáticamente si hay sesión persistente
3. Si existe y es válida, el usuario queda logueado automáticamente
4. Si no existe o expiró, se muestra la pantalla de login

### Cerrar sesión:

1. Usuario hace logout
2. Se limpian todos los datos de AsyncStorage
3. Usuario es redirigido al login

## 🔑 Keys de AsyncStorage

```typescript
// StorageService.ts
static readonly SESSION_USER_KEY = "cookly_current_user";
static readonly SESSION_REMEMBER_KEY = "cookly_remember_session";
```

## ⚠️ Consideraciones de Seguridad

- **Tokens seguros**: Supabase maneja automáticamente el refresh de tokens
- **Datos sensibles**: Solo se almacena información básica del usuario (no contraseñas)
- **Expiración**: Las sesiones expiran automáticamente según configuración de Supabase
- **Limpieza**: Los datos se limpian al hacer logout o si la sesión expira

## 🧪 Testing

Para probar la funcionalidad:

1. **Login con "Recordar sesión" activado**:

   - Hacer login
   - Cerrar completamente la app
   - Volver a abrir → Debe mantener sesión

2. **Login sin "Recordar sesión"**:

   - Desactivar switch
   - Hacer login
   - Cerrar app
   - Volver a abrir → Debe mostrar login

3. **Logout**:
   - Hacer logout
   - Volver a abrir app → Debe mostrar login

## 📚 Librerías Utilizadas

- `@react-native-async-storage/async-storage`: Almacenamiento local
- `@supabase/supabase-js`: Cliente de Supabase con soporte para persistencia
- `react-native-url-polyfill`: Polyfill para URLs en React Native

## 🔄 Estados de la App

```typescript
// Posibles estados de autenticación
tipo EstadoAuth =
  | "cargando"      // Verificando sesión inicial
  | "logueado"      // Usuario autenticado
  | "no-logueado"   // Sin sesión activa
```

## 🚨 Troubleshooting

### Sesión no se mantiene:

- Verificar que `persistSession: true` en supabaseClient
- Verificar que AsyncStorage esté instalado
- Revisar logs de errores en storage

### App no carga usuario:

- Verificar conexión a Supabase
- Revisar que la tabla `usuarios` esté sincronizada
- Verificar que el token no haya expirado

### Performance:

- La verificación de sesión es asíncrona y no bloquea la UI
- Los datos se almacenan localmente para acceso rápido
