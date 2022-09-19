/*
    Memorable Integer Generator: JavaScript Port
*/

String.prototype.reverse = function() {
    return this.valueOf().split("").reverse().join("");
}

class MIG {
    constructor(minimum, maximum) {
        this.minimum = minimum;
        this.maximum = maximum;
    
        this.list = [];
        for (let _num = minimum; _num < maximum; _num++) {
            let _numAsStr = _num.toString();

            if (_numAsStr.reverse() === _numAsStr) {
                // palindrome
                this.list.push(_num);
            } else if (_num % 100 == 0) {
                // divisible by 100
                this.list.push(_num);
            } else if (new Set(_numAsStr).size <= 2) {
                // common
                this.list.push(_num);
            } else if ("0123456789".indexOf(_numAsStr) != -1) {
                // increasing
                this.list.push(_num);
            } else if ("9876543210".indexOf(_numAsStr) != -1) {
                // decreasing
                this.list.push(_num);
            }
        }
        // To-Do: is repeating
    }

    generate() {
        return this.list[Math.floor(Math.random() * this.list.length)];
    }
}