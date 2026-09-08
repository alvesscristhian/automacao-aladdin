function calculateTotal(data) {
    const dezenaTotal = (data.dezena || []).reduce(
        (acc, item) => acc + item.value, 
        0,
    );
    const centenaTotal = (data.centena || []).reduce(
        (acc, item) => acc + item.value, 
        0,
    );

    const milharTotal = (data.milhar || []).reduce(
        (acc, item) => acc + item.value, 
        0,
    );

    const ternoGrupoTotal = (data.ternoGrupo || []).reduce(
        (acc, item) => acc + item.value,
        0,
    );

    return dezenaTotal + centenaTotal + milharTotal + ternoGrupoTotal;
}

module.exports = calculateTotal;