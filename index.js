
//OBTENGO TODOS LOS VEHICULOS
let pullDato = '';
const obtenerVehiculoUsuario = async() => {
    try {
        const dato = await axios.get('http://localhost:4000/api/v1/consultas');
        pullDato = await dato.data;
        mostrarVehiculoUsuario(pullDato);
    } catch (error) {
        console.log(error)
    }
}

//DIVIDE EN FUERA Y DENTRO A LOS REGISTROS
const mostrarVehiculoUsuario = (d) => {
    d.forEach((c) => {
        const listadoFalse = document.getElementById('listado-false');
        const listadoTrue = document.getElementById('listado-true');
        c.estado === 'false' ? listadoFalse.appendChild(datosVehiculoUsuario(c)) : listadoTrue.appendChild(datosVehiculoUsuario(c));
    });
    clicRegistro();
}

//SE MUESTRA EN LA APP
obtenerVehiculoUsuario();

//RECUADRO DE VEHICULOS Y USUARIO
const datosVehiculoUsuario = (datosVehiculoUsuario) => {
    const registro = document.createElement('div');
    registro.setAttribute('id', datosVehiculoUsuario.id_vehiculo);
    registro.setAttribute('idregistro', datosVehiculoUsuario.id_vehiculo);
    registro.className = 'registro';
    registro.innerHTML = `
        <p><span class="${ datosVehiculoUsuario.estado }"><i class="fa-solid fa-car"></i></span>${ datosVehiculoUsuario.placa }</p>
        <p class="subtitulo">${ datosVehiculoUsuario.modelo }</p>
        <p class="subtitulo">${ datosVehiculoUsuario.nombre }</p>
    `;
    return registro;
}

//GUARDAR UN USUARIO Y VEHICULO EN LA DB
document.getElementById('formularioAgr').addEventListener('submit', async(e)=>{
    e.preventDefault();

    //convertimos el FormData en JSON
    const formData = Object.fromEntries(new FormData(e.target))
    const formUsuarioVehiculo = JSON.stringify(formData);
    e.target.reset();
    //enviamos los datos en JSON al API
    await fetch('http://localhost:4000/api/v1/consultas', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: {formUsuarioVehiculo}
    })
    .then(response => response.json())
    .then(result => {
        swal({title: result.titulo,text: result.descr,icon: result.estado,});

        const formUV = JSON.parse(formUsuarioVehiculo);
        formUV.id_vehiculo = result.id_vehiculo['id_vehiculo'];
        const listadoFalse = document.getElementById('listado-false');
        listadoFalse.appendChild(datosVehiculoUsuario(formUV));
        clicRegistro();
    })
})


//OBTEMOS EL ID DEL VEHICULO
const clicRegistro = () =>{
    document.querySelectorAll('.registro').forEach(reg => {
        
        reg.addEventListener('click', e => {
            if(localStorage.getItem('idVehiculo')){
                console.log(localStorage.getItem('idVehiculo'));
                document.getElementById(localStorage.getItem('idVehiculo')).style.backgroundColor = '#18191A';
            }
            //sebas marica
            //localStorage.getItem('idVehiculo') ? localStorage.removeItem('idVehiculo') : console.log('no hay variable: se crea')
            
            const tyf = e.target.firstElementChild.firstChild.className == 'true' ? 'false' : 'true'

            e.target.style.backgroundColor = "#0F0F10";

            let activarB = document.querySelector(`#${ tyf }`);
            let deleteB = document.querySelector("#delete");
            activarB.removeAttribute("disabled");
            deleteB.removeAttribute("disabled");

            localStorage.setItem('idVehiculo', e.target.getAttribute("idregistro"));
            console.log(localStorage.getItem('idVehiculo'));
            console.log('--------------');
        })
    })
}


//TRANSFORMAMOS OBJETOS A JSON
const objetoAJson = (obj) => {
    return JSON.stringify(obj);
}


//ALTERAR EL ESTADO DEL VEHICULO
document.querySelectorAll('.botonAccion').forEach( aB => {
    aB.addEventListener('click', async() => {
        //ESTA LINEA OBTIENE EL VALOR DEL BOTON (TRUE, FALSE, DELETE)
        //ESTA ES LA VARIABLE DEL VEHICULO "aB.id"
        const idVehiculo = localStorage.getItem('idVehiculo');
        const updateEstadoVehiculo = objetoAJson({
            "estado": aB.id,
            "idVehiculo": idVehiculo,
            "matricula": "Matricula",
            "marca": "marca",
            "nombre": "nombre"
        });
        if(!idVehiculo){
            alert('No ha seleccionado un Vehiculo');
            return;
        }else{
            localStorage.removeItem('idVehiculo');
            
            await fetch('http://localhost:4000/api/v1/consultas/updateVehiculo/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: updateEstadoVehiculo
            })
            .then(response => response.json())
            .then(result => {
                swal({
                    title: result.titulo,
                    text: result.descr,
                    icon: result.estado,
                });
                const formUV = JSON.parse(updateEstadoVehiculo);
                const registro = document.createElement('div'); //crea un elemento
                registro.setAttribute("idregistro", formUV.idVehiculo);
                registro.className = 'registro';
                registro.innerHTML = `
                    <p><span class="${ formUV.estado }"><i class="fa-solid fa-car"></i></span>${ formUV.matricula }</p>
                    <p class="subtitulo">${ formUV.marca } </p>
                    <p class="subtitulo">${ formUV.nombre } </p>
                `;
                const listadoFalse = document.getElementById('listado-false');
                const listadoTrue = document.getElementById('listado-true');
                if( formUV.estado === 'false' ){
                    const nino = document.querySelector(`[idregistro="${ formUV.idVehiculo }"]`);
                    listadoTrue.removeChild(nino);
                    listadoFalse.appendChild(registro);
                }else{
                    const nino = document.querySelector(`[idregistro="${ formUV.idVehiculo }"]`);
                    listadoFalse.removeChild(nino);
                    listadoTrue.appendChild(registro);
                }
                clicRegistro();
            })
            .catch(err => {
                alert(err);
            })
        }
    })
})