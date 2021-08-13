class Mathematic {
    static random(min, max) {
        if(min === undefined || max === undefined) {
            return "A random function must has 2 parameters.";
        }
        min = parseInt(Math.abs(min));
        max = parseInt(Math.abs(max));
        return min + Math.floor(Math.random() * ((max - min) + 1));
    }
    static sortNumber(arr) {
        return arr.sort((a, b) => a - b);
    }
    static format(num) {
        return Intl.NumberFormat().format(num);
    }
    static toNormalNumber(num) {
        return parseFloat(num.replace(/,/g, ""));
    }
}
//export {Mathematic};
module.exports.Mathematic = Mathematic;