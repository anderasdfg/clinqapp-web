// src/lib/constants/messages.ts

export const AuthMessages = {
  EMAIL_ALREADY_REGISTERED:
    'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.',
  DNI_ALREADY_REGISTERED:
    'Este DNI ya está registrado. Si ya tienes una cuenta, por favor inicia sesión.',
  ACCOUNT_CREATED_SUCCESS:
    'Cuenta creada exitosamente. Por favor, verifica tu correo electrónico.',
  LOGIN_SUCCESS:
    'Inicio de sesión exitoso.',
  INVALID_CREDENTIALS:
    'Correo electrónico o contraseña incorrectos.',
  EMAIL_NOT_CONFIRMED:
    'Por favor, verifica tu correo electrónico antes de iniciar sesión.',
  REGISTRATION_ERROR:
    'Error al crear la cuenta. Por favor, intenta nuevamente.',
  LOGIN_ERROR:
    'Error al iniciar sesión.',
  ORGANIZATION_CREATION_ERROR:
    'Error al crear la organización. Por favor, contacta a soporte.',
  PROFILE_CREATION_ERROR:
    'Error al crear el perfil de usuario. Por favor, contacta a soporte.',
  UNEXPECTED_ERROR:
    'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
  VERIFICATION_EMAIL_RESENT:
    'Correo de verificación reenviado exitosamente.',
  VERIFICATION_EMAIL_ERROR:
    'Error al reenviar el correo de verificación.',
  PASSWORD_RESET_SENT:
    'Se ha enviado un correo con instrucciones para restablecer tu contraseña.',
  PASSWORD_RESET_ERROR:
    'Error al enviar el correo de recuperación.',
} as const;

export const ValidationMessages = {
  EMAIL_REQUIRED: 'El correo electrónico es requerido',
  EMAIL_INVALID: 'Por favor, ingresa un correo electrónico válido',
  EMAIL_TOO_SHORT: 'El correo electrónico debe tener al menos 5 caracteres',
  EMAIL_TOO_LONG: 'El correo electrónico no puede exceder 254 caracteres',
  PASSWORD_REQUIRED: 'La contraseña es requerida',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
  PASSWORD_TOO_LONG: 'La contraseña no puede exceder 128 caracteres',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
  FULL_NAME_REQUIRED: 'El nombre completo es requerido',
  FULL_NAME_TOO_SHORT: 'El nombre debe tener al menos 2 caracteres',
  FULL_NAME_TOO_LONG: 'El nombre no puede exceder 100 caracteres',
  DNI_REQUIRED: 'El DNI es requerido',
  DNI_INVALID: 'El DNI debe tener exactamente 8 dígitos',
  NAME_REQUIRED: 'El nombre es requerido',
  NAME_TOO_SHORT: 'El nombre debe tener al menos 2 caracteres',
  NAME_TOO_LONG: 'El nombre no puede exceder 50 caracteres',
  PHONE_INVALID: 'El número de teléfono debe tener 9 dígitos',
} as const;
