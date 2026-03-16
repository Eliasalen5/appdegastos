// App con localStorage (sin Firebase por ahora)

let perfilActual = 'elias';
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];

// Inicializar
document.getElementById('fecha').value = new Date().toISOString().split('T')[0];

// Guardar en localStorage
function guardarGastos() {
    localStorage.setItem('gastos', JSON.stringify(gastos));
}

// Cambiar perfil
function selectPerfil(perfil) {
    console.log('Cambiando perfil a:', perfil);
    perfilActual = perfil;
    document.querySelectorAll('.perfil-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`button[onclick="selectPerfil('${perfil}')"]`).classList.add('active');
    renderGastos();
}

// Agregar gasto
function agregarGasto() {
    console.log('Agregando gasto...');
    const descripcion = document.getElementById('descripcion').value.trim();
    const monto = parseFloat(document.getElementById('monto').value);
    const tipo = document.getElementById('tipo').value;
    const fechaInput = document.getElementById('fecha').value;
    const categoria = document.getElementById('categoria').value;

    if (!descripcion || isNaN(monto) || monto <= 0) {
        alert('Ingresa descripción y monto válido');
        return;
    }

    const gasto = {
        id: Date.now().toString(),
        perfil: perfilActual,
        descripcion,
        monto: tipo === 'ingreso' ? Math.abs(monto) : -Math.abs(monto),
        tipo,
        categoria,
        fecha: fechaInput ? new Date(fechaInput).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES')
    };

    console.log('Gasto:', gasto);
    gastos.push(gasto);
    guardarGastos();
    
    document.getElementById('descripcion').value = '';
    document.getElementById('monto').value = '';
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    
    renderGastos();
    actualizarResumen();
}

// Eliminar gasto
function eliminarGasto(id) {
    console.log('Eliminando gasto:', id);
    gastos = gastos.filter(g => g.id !== id);
    guardarGastos();
    renderGastos();
    actualizarResumen();
}

// Renderizar lista de gastos
function renderGastos() {
    console.log('Renderizando gastos para perfil:', perfilActual);
    const lista = document.getElementById('gastosLista');
    const gastosPerfil = gastos.filter(g => g.perfil === perfilActual);

    if (gastosPerfil.length === 0) {
        lista.innerHTML = '<div class="empty">No hay gastos</div>';
        return;
    }

    lista.innerHTML = gastosPerfil
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .map(g => `
            <div class="gasto-item">
                <div class="gasto-info">
                    <div class="gasto-nombre">${g.descripcion}</div>
                    <div class="gasto-fecha">${g.fecha} • ${g.categoria}</div>
                </div>
                <div class="gasto-monto ${g.tipo === 'ingreso' ? 'ingreso' : ''}">
                    ${g.tipo === 'ingreso' ? '+' : ''}$${Math.abs(g.monto).toFixed(2)}
                </div>
                <button class="btn-eliminar" onclick="eliminarGasto('${g.id}')">×</button>
            </div>
        `).join('');
}

// Actualizar resumen
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

// Inicializar
renderGastos();
actualizarResumen();

console.log('App iniciada correctamente');
