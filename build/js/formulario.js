// JavaScript para el formulario de contacto - Bombas Ayala
document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formularioContacto');
    
    // URL de tu Google Apps Script
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxi7Y3JQYsH6GrBmMhj3mAcZIZBeUx7fycHSKbA86wPBYWHcXsZ9MNXX4zXdufSRkQLRA/exec';

    
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener datos del formulario
        const formData = new FormData(this);
        
        // Validaciones básicas
        if (!validarFormulario(formData)) {
            return;
        }
        
        // Mostrar indicador de carga
        const submitBtn = this.querySelector('.boton-enviar');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
        submitBtn.disabled = true;
        
        // Mostrar mensaje de procesamiento
        mostrarMensaje('Enviando tu consulta...', 'info');
        
        // CAMBIO AQUÍ: Convertir FormData a URLSearchParams para e.parameter
        const params = new URLSearchParams();
        for (let [key, value] of formData.entries()) {
            params.append(key, value);
        }
        
        // Enviar datos a Google Sheets
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Éxito
                mostrarMensaje('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
                this.reset(); // Limpiar formulario
                                
            } else {
                // Error del servidor
                mostrarMensaje('Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.', 'error');
                console.error('Error del servidor:', data.message);
            }
        })
        .catch(error => {
            console.error('Error de conexión:', error);
            mostrarMensaje('Error de conexión. Por favor, verifica tu internet e intenta nuevamente.', 'error');
        })
        .finally(() => {
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    });
    
    // Función para validar el formulario
    function validarFormulario(formData) {
        const nombre = formData.get('nombre').trim();
        const email = formData.get('email').trim();
        const mensaje = formData.get('mensaje').trim();
        const telefono = formData.get('telefono').trim();
        
        // Validar campos obligatorios
        if (!nombre) {
            mostrarMensaje('Por favor, ingresa tu nombre completo', 'error');
            document.getElementById('nombre').focus();
            return false;
        }
        
        if (!email) {
            mostrarMensaje('Por favor, ingresa tu correo electrónico', 'error');
            document.getElementById('email').focus();
            return false;
        }
        
        if (!mensaje) {
            mostrarMensaje('Por favor, ingresa tu mensaje', 'error');
            document.getElementById('mensaje').focus();
            return false;
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            mostrarMensaje('Por favor, ingresa un email válido', 'error');
            document.getElementById('email').focus();
            return false;
        }
        
        // Validar teléfono peruano (si se proporciona)
        if (telefono) {
            const telefonoRegex = /^(\+51|51)?[9][0-9]{8}$/;
            const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
            if (!telefonoRegex.test(telefonoLimpio)) {
                mostrarMensaje('Por favor, ingresa un teléfono válido (debe comenzar con 9)', 'error');
                document.getElementById('telefono').focus();
                return false;
            }
        }
        
        return true;
    }
    
    // Función para mostrar mensajes al usuario
    function mostrarMensaje(mensaje, tipo) {
        // Remover mensaje anterior si existe
        const mensajeAnterior = document.querySelector('.mensaje-formulario');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
        
        // Crear nuevo mensaje
        const divMensaje = document.createElement('div');
        divMensaje.className = `mensaje-formulario mensaje-${tipo}`;
        divMensaje.innerHTML = `
            <i class="fas ${tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            ${mensaje}
        `;
        
        // Insertar antes del formulario
        formulario.parentNode.insertBefore(divMensaje, formulario);
        
        // Auto-remover después de 5 segundos (excepto para éxito)
        if (tipo !== 'success') {
            setTimeout(() => {
                if (divMensaje.parentNode) {
                    divMensaje.remove();
                }
            }, 5000);
        }
        
        // Scroll hacia el mensaje
        divMensaje.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Mejorar la experiencia de usuario en los campos
    const campos = formulario.querySelectorAll('input, select, textarea');
    campos.forEach(campo => {
        campo.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#ff6b6b';
            } else {
                this.style.borderColor = '';
            }
        });
        
        campo.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(255, 107, 107)') {
                this.style.borderColor = '';
            }
        });
    });
    
    // Formatear número de teléfono mientras se escribe
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function() {
            let valor = this.value.replace(/\D/g, ''); // Solo números
            
            if (valor.length > 0) {
                // Formato: 999 999 999
                if (valor.length <= 3) {
                    valor = valor;
                } else if (valor.length <= 6) {
                    valor = valor.slice(0, 3) + ' ' + valor.slice(3);
                } else {
                    valor = valor.slice(0, 3) + ' ' + valor.slice(3, 6) + ' ' + valor.slice(6, 9);
                }
            }
            
            this.value = valor;
        });
    }
});

// Estilos CSS para los mensajes
const estilosMensajes = `
<style>
.mensaje-formulario {
    padding: 15px 20px;
    margin-bottom: 20px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    animation: slideDown 0.3s ease-out;
}

.mensaje-success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.mensaje-error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.mensaje-info {
    background-color: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.boton-enviar:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
</style>
`;

// Agregar estilos al documento
document.head.insertAdjacentHTML('beforeend', estilosMensajes);