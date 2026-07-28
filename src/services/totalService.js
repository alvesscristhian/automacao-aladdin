function calculateTotal(data) {
    const centenaTotal = data.centena.reduce(
        (acc, item) => acc + item.value, 
        0,
    );

    const milharTotal = data.milhar.reduce(
        (acc, item) => acc + item.value, 
        0,
    );

    return centenaTotal + milharTotal;
}

module.exports = calculateTotal;