

const admin = (req, res) => {
    res.render('inicio/admin', {
        pagina: 'Inicio',
        mensaje: 'Nuestro Establecimiento cuenta con distintos metodos de aprendizaje',
        barra: true
    })
}

const dashboard = (req, res) => {
    res.render('inicio/dashboard', {
        pagina: 'Dashboard',
        barra: true
    })
}

export {
    admin,
    dashboard
}