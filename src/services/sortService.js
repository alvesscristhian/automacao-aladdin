function sortNumbers(numbers) {
    return numbers.sort((a, b) => {
        const first = parseInt(
            a.number.replace(/\*/g, ''),
        );
        const second = parseInt(
            b.number.replace(/\*/g, ''),
        );
        return first - second;
    });
}

module.exports = sortNumbers;