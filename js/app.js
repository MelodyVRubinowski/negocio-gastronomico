// ESTADO DEL CARRITO
let carrito = [];

// AGREGAR AL CARRITO
function agregarAlCarrito(nombre, precio, servicio) {
    const itemExistente = carrito.find(item => item.nombre === nombre);
    
    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({
            nombre,
            precio,
            cantidad: 1,
            servicio
        });
    }
    
    actualizarCarrito();
    mostrarCarrito();
    mostrarNotificacion(`${nombre} agregado al pedido`);
}

// ACTUALIZAR CARRITO
function actualizarCarrito() {
    // Actualizar contador en navbar
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    document.getElementById('contador-pedido').textContent = totalItems;
    
    // Renderizar items en carrito flotante
    const carritoItems = document.getElementById('carrito-items');
    carritoItems.innerHTML = '';
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p style="text-align: center; color: #999;">Tu carrito está vacío</p>';
    } else {
        carrito.forEach((item, index) => {
            const itemHTML = `
                <div class="carrito-item">
                    <div class="carrito-item-info">
                        <div class="carrito-item-nombre">${item.nombre}</div>
                        <div class="carrito-item-cantidad">
                            <button onclick="disminuirCantidad(${index})">−</button>
                            <span>${item.cantidad}</span>
                            <button onclick="aumentarCantidad(${index})">+</button>
                        </div>
                    </div>
                    <div class="carrito-item-precio">$${(item.precio * item.cantidad).toFixed(2)}</div>
                    <button class="carrito-item-eliminar" onclick="eliminarDelCarrito(${index})">✕</button>
                </div>
            `;
            carritoItems.innerHTML += itemHTML;
        });
    }
    
    // Actualizar total
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('total-carrito').textContent = total.toFixed(2);
}

// AUMENTAR CANTIDAD
function aumentarCantidad(index) {
    carrito[index].cantidad++;
    actualizarCarrito();
}

// DISMINUIR CANTIDAD
function disminuirCantidad(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
    } else {
        eliminarDelCarrito(index);
    }
    actualizarCarrito();
}

// ELIMINAR DEL CARRITO
function eliminarDelCarrito(index) {
    const nombreItem = carrito[index].nombre;
    carrito.splice(index, 1);
    actualizarCarrito();
    mostrarNotificacion(`${nombreItem} eliminado del pedido`);
}

// MOSTRAR/CERRAR CARRITO
function mostrarCarrito() {
    const carrritoFlotante = document.getElementById('carrito-flotante');
    if (carrito.length > 0) {
        carrritoFlotante.classList.remove('hidden');
    }
}

function cerrarCarrito() {
    document.getElementById('carrito-flotante').classList.add('hidden');
}

// FILTRAR MENÚ
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover clase active de todos los botones en el mismo contenedor
            this.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const categoria = this.getAttribute('data-category') || this.getAttribute('data-category-roti');
            const menuGrid = this.closest('.menu-container').querySelector('.menu-grid');
            const menuItems = menuGrid.querySelectorAll('.menu-item');
            
            menuItems.forEach(item => {
                const itemCategoria = item.getAttribute('data-category') || item.getAttribute('data-category-roti');
                if (categoria === 'todos' || itemCategoria === categoria) {
                    item.style.display = 'block';
                    setTimeout(() => item.style.opacity = '1', 10);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => item.style.display = 'none', 300);
                }
            });
        });
    });
});

// ENVIAR POR WHATSAPP
function enviarPorWhatsApp(seccion) {
    if (carrito.length === 0) {
        alert('Por favor, agrega items al carrito');
        return;
    }
    
    mostrarCarrito();
    document.getElementById('tipo-servicio').focus();
}

function abrirWhatsApp(tipo, nombre) {
    const mensaje = `Hola, estoy interesado en ${tipo === 'escuela' ? 'la inscripción a: ' + nombre : 'este servicio'}. ¿Puedo obtener más información?`;
    const numeroWhatsApp = '1234567890'; // Cambiar por tu número
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
}

// CONFIRMAR PEDIDO POR WHATSAPP
function confirmarPedidoWhatsApp() {
    const nombre = document.getElementById('nombre-cliente').value;
    const tipoServicio = document.getElementById('tipo-servicio').value;
    
    if (!nombre || !tipoServicio) {
        alert('Por favor, completa todos los campos');
        return;
    }
    
    // Construir mensaje
    let mensaje = `*NUEVO PEDIDO*\n\n`;
    mensaje += `*Cliente:* ${nombre}\n`;
    mensaje += `*Tipo de Servicio:* ${obtenerTextoServicio(tipoServicio)}\n\n`;
    mensaje += `*DETALLES DEL PEDIDO:*\n\n`;
    
    let total = 0;
    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        mensaje += `• ${item.nombre}\n`;
        mensaje += `  Cantidad: ${item.cantidad} x $${item.precio}\n`;
        mensaje += `  Subtotal: $${subtotal.toFixed(2)}\n\n`;
    });
    
    mensaje += `*TOTAL: $${total.toFixed(2)}*\n\n`;
    mensaje += `*Horario de pedido:* ${new Date().toLocaleString('es-ES')}\n\n`;
    mensaje += `Por favor, confirmar disponibilidad. Gracias.`;
    
    // Codificar y abrir WhatsApp
    const numeroWhatsApp = '1234567890'; // Cambiar por tu número
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    // Limpiar carrito y cerrar
    carrito = [];
    actualizarCarrito();
    cerrarCarrito();
    document.getElementById('formulario-pedido').reset();
    
    // Abrir WhatsApp
    window.open(urlWhatsApp, '_blank');
    mostrarNotificacion('¡Abriendo WhatsApp para enviar tu pedido!');
}

// OBTENER TEXTO DEL SERVICIO
function obtenerTextoServicio(valor) {
    const opciones = {
        'reserva': '🍽️ Reserva de Mesa (Restaurante)',
        'inscripcion': '📚 Inscripción Escuela de Cocina',
        'recoger': '🍗 Pedido para Recoger (Rotisería)'
    };
    return opciones[valor] || valor;
}

// NOTIFICACIONES
function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary-color);
        color: var(--white);
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notificacion);
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// ANIMACIÓN DE NOTIFICACIONES
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// SCROLL SUAVE
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// INICIALIZAR
window.addEventListener('load', () => {
    actualizarCarrito();
});