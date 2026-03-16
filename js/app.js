let perfilActual = 'elias';
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
let alarmaActiva = false;
let alarmTimeout = null;

function selectPerfil(perfil) {
    perfilActual = perfil;
    document.querySelectorAll('.perfil-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`button[onclick="selectPerfil('${perfil}')"]`).classList.add('active');
    renderGastos();
}

function agregarGasto() {
    const descripcion = document.getElementById('descripcion').value.trim();
    const monto = parseFloat(document.getElementById('monto').value);
    const tipo = document.getElementById('tipo').value;
    const fechaInput = document.getElementById('fecha').value;
    const categoria = document.getElementById('categoria').value;

    if (!descripcion || isNaN(monto) || monto <= 0) {
        alert('Ingresa una descripción y monto válido');
        return;
    }

    const gasto = {
        id: Date.now(),
        perfil: perfilActual,
        descripcion,
        monto: tipo === 'ingreso' ? Math.abs(monto) : -Math.abs(monto),
        tipo,
        categoria,
        fecha: fechaInput ? new Date(fechaInput).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES')
    };

    gastos.push(gasto);
    localStorage.setItem('gastos', JSON.stringify(gastos));
    
    document.getElementById('descripcion').value = '';
    document.getElementById('monto').value = '';
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    
    renderGastos();
    actualizarResumen();
}

function eliminarGasto(id) {
    gastos = gastos.filter(g => g.id !== id);
    localStorage.setItem('gastos', JSON.stringify(gastos));
    renderGastos();
    actualizarResumen();
}

function renderGastos() {
    const lista = document.getElementById('gastosLista');
    const gastosPerfil = gastos.filter(g => g.perfil === perfilActual);

    if (gastosPerfil.length === 0) {
        lista.innerHTML = '<div class="empty">No hay gastos registrados</div>';
        return;
    }

    lista.innerHTML = gastosPerfil
        .sort((a, b) => b.id - a.id)
        .map(g => `
            <div class="gasto-item">
                <div class="gasto-info">
                    <div class="gasto-nombre">${g.descripcion}</div>
                    <div class="gasto-fecha">${g.fecha} • ${g.categoria}</div>
                </div>
                <div class="gasto-monto ${g.tipo === 'ingreso' ? 'ingreso' : ''}">
                    ${g.tipo === 'ingreso' ? '+' : ''}$${Math.abs(g.monto).toFixed(2)}
                </div>
                <button class="btn-eliminar" onclick="eliminarGasto(${g.id})">×</button>
            </div>
        `).join('');
}

function actualizarResumen() {
    const eliasGastos = gastos.filter(g => g.perfil === 'elias' && g.tipo === 'gasto').reduce((sum, g) => sum + Math.abs(g.monto), 0);
    const eliasIngresos = gastos.filter(g => g.perfil === 'elias' && g.tipo === 'ingreso').reduce((sum, g) => sum + Math.abs(g.monto), 0);
    const elias = eliasIngresos - eliasGastos;
    
    const nadiaGastos = gastos.filter(g => g.perfil === 'nadia' && g.tipo === 'gasto').reduce((sum, g) => sum + Math.abs(g.monto), 0);
    const nadiaIngresos = gastos.filter(g => g.perfil === 'nadia' && g.tipo === 'ingreso').reduce((sum, g) => sum + Math.abs(g.monto), 0);
    const nadia = nadiaIngresos - nadiaGastos;
    
    document.getElementById('gastosElias').textContent = `$${eliasGastos.toFixed(2)}`;
    document.getElementById('ingresosElias').textContent = `$${eliasIngresos.toFixed(2)}`;
    document.getElementById('totalElias').textContent = elias >= 0 ? `+$${elias.toFixed(2)}` : `-$${Math.abs(elias).toFixed(2)}`;
    document.getElementById('gastosNadia').textContent = `$${nadiaGastos.toFixed(2)}`;
    document.getElementById('ingresosNadia').textContent = `$${nadiaIngresos.toFixed(2)}`;
    document.getElementById('totalNadia').textContent = nadia >= 0 ? `+$${nadia.toFixed(2)}` : `-$${Math.abs(nadia).toFixed(2)}`;
    document.getElementById('totalGeneral').textContent = `$${(elias + nadia).toFixed(2)}`;
    
    document.getElementById('totalElias').style.color = elias >= 0 ? '#6bff8a' : '#ff6b6b';
    document.getElementById('totalNadia').style.color = nadia >= 0 ? '#6bff8a' : '#ff6b6b';
}

function setAlarm() {
    const timeInput = document.getElementById('alarmTime').value;
    const status = document.getElementById('alarmStatus');
    
    if (!timeInput) {
        alert('Selecciona una hora');
        return;
    }

    if (alarmaActiva) {
        clearTimeout(alarmTimeout);
        alarmaActiva = false;
        status.textContent = '';
        document.querySelector('.alarm-btn').textContent = 'Activar Alarma';
        localStorage.removeItem('alarmTime');
        return;
    }

    const [hours, minutes] = timeInput.split(':');
    const now = new Date();
    let alarmDate = new Date();
    alarmDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (alarmDate <= now) {
        alarmDate.setDate(alarmDate.getDate() + 1);
    }

    const delay = alarmDate - now;
    
    alarmTimeout = setTimeout(() => {
        if (Notification.permission === 'granted') {
            new Notification('Recordatorio de Gastos', {
                body: '¡No olvides registrar tus gastos del día!',
                icon: '💰'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Recordatorio de Gastos', {
                        body: '¡No olvides registrar tus gastos del día!',
                        icon: '💰'
                    });
                }
            });
        } else {
            alert('⏰ ¡Recordatorio! No olvides registrar tus gastos del día');
        }
        
        scheduleAlarm(timeInput);
    }, delay);

    localStorage.setItem('alarmTime', timeInput);
    status.textContent = `Alarma activada para las ${timeInput}`;
    status.style.display = 'block';
    document.querySelector('.alarm-btn').textContent = 'Desactivar Alarma';
    alarmaActiva = true;
}

function scheduleAlarm(time) {
    const [hours, minutes] = time.split(':');
    
    const runAlarm = () => {
        const now = new Date();
        const alarmDate = new Date();
        alarmDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (alarmDate <= now) {
            alarmDate.setDate(alarmDate.getDate() + 1);
        }
        
        const delay = alarmDate - now;
        alarmTimeout = setTimeout(() => {
            if (Notification.permission === 'granted') {
                new Notification('Recordatorio de Gastos', {
                    body: '¡No olvides registrar tus gastos del día!',
                    icon: '💰'
                });
            } else {
                alert('⏰ ¡Recordatorio! No olvides registrar tus gastos del día');
            }
            runAlarm();
        }, delay);
    };
    
    runAlarm();
}

document.addEventListener('DOMContentLoaded', async () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').value = today;
    
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('sw.js');
            console.log('SW registrado');
        } catch (e) {
            console.log('SW error:', e);
        }
    }
    
    renderGastos();
    actualizarResumen();
    
    const savedAlarm = localStorage.getItem('alarmTime');
    if (savedAlarm) {
        document.getElementById('alarmTime').value = savedAlarm;
        setAlarm();
    }
    
    requestNotificationPermission();
});

async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notificaciones permitidas');
        }
    }
    
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U')
            });
            localStorage.setItem('pushSubscription', JSON.stringify(subscription));
        } catch (e) {
            console.log('Push subscription error:', e);
        }
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
