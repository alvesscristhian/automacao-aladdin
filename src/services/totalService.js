function calculateTotal(data) {
    const centenaTotal = data.centena.reduce(
        (acc, item) => acc + item.value, 
        0,
    );

    const milharTotal = data.milhar.reduce(
        (acc, item) => acc + item.value, 
        0,
    );

    const ternoGrupoTotal = (data.ternoGrupo || []).reduce(
        (acc, item) => acc + item.value,
        0,
    );

    return centenaTotal + milharTotal + ternoGrupoTotal;
}

module.exports = calculateTotal;