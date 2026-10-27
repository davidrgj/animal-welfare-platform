# language: es
Característica: Acceso a la plataforma de bienestar animal
  Como productor, veterinario o administrador
  Quiero autenticarme con correo y contraseña
  Para ver el estado ICA de mis predios

  Escenario: Ingreso con credenciales válidas
    Dado que estoy en la pantalla de inicio de sesión
    Cuando ingreso un correo y una contraseña válidos
    Entonces debo ver el tablero "Estado ICA"

  Escenario: Rechazo de credenciales inválidas
    Dado que estoy en la pantalla de inicio de sesión
    Cuando ingreso una contraseña incorrecta
    Entonces debo ver el mensaje "Correo o contraseña no válidos"

  Escenario: Ruta protegida sin sesión
    Dado que no tengo una sesión activa
    Cuando abro el tablero directamente
    Entonces debo ser redirigido al inicio de sesión
